from mongoengine.errors import DoesNotExist
from bson import DBRef, ObjectId


def get_safe_list(parent_doc, field_name):
    """
    Safely retrieves a ListField of ReferenceFields, automatically removing
    dangling references (zombies) to self-heal the database.

    Args:
        parent_doc: The MongoEngine document instance (e.g., Classroom).
        field_name: The string name of the list field (e.g., 'students').

    Returns:
        list: A list of valid, existing referenced documents.
    """
    if not hasattr(parent_doc, field_name):
        return []

    original_list = getattr(parent_doc, field_name)
    valid_items = []
    has_changes = False

    # We iterate a copy of the list because we might modify the original structure
    # or simply to filter. However, modifying 'original_list' in place via removal
    # is tricky while iterating. Better to build a new list of valid items.

    # Note: iterating 'original_list' yields Proxy objects.
    # Accessing fields on them triggers the dereference.

    for item in original_list:
        try:
            # Force dereference by accessing the PK (ID) and another field.
            # Just accessing .id might be served from the DBRef/Proxy without DB hit.
            # Accessing a concrete field forces the DB lookup.
            if item.pk and item._data:
                # _data access usually ensures it's loaded.
                # Or just accessing a known field like 'id' is safest start,
                # but 'id' might not trigger DoesNotExist if it's just the proxy ID.
                # We typically need to touch a field that isn't the ID.
                # But 'item' itself being truthy usually implies existence if fetched.
                # Let's try explicitly reloading if in doubt, or just accessing 'id'
                # inside the try block is standard.
                # Actually, MongoEngine proxies raise DoesNotExist immediately upon access
                # if the doc is missing.
                _ = item.id
                valid_items.append(item)
        except (DoesNotExist, Exception):
            # Found a zombie
            has_changes = True
            continue

    if has_changes:
        # Update the parent document to remove zombies permanently
        # This is the "Self-Healing" part.
        setattr(parent_doc, field_name, valid_items)
        parent_doc.save()
        print(f"Self-healed {parent_doc.__class__.__name__} {parent_doc.id}: "
              f"Removed dangling references from {field_name}")

    return valid_items


def get_safe_reference(parent_doc, field_name):
    """
    Safely retrieves a ReferenceField, setting it to None if the reference is dangling.
    """
    if not hasattr(parent_doc, field_name):
        return None

    try:
        # Accessing the field triggers dereference in MongoEngine
        ref = getattr(parent_doc, field_name)

        if not ref:
            return None

        # If it's a DBRef or ObjectId (from no_dereference), we must verify it manually
        if isinstance(ref, (DBRef, ObjectId)):
            # Find the document class for this field
            field = parent_doc._fields.get(field_name)
            if not field:
                return None

            target_cls = field.document_type
            ref_id = ref.id if isinstance(ref, DBRef) else ref

            # Query existence
            actual_doc = target_cls.objects(id=ref_id).first()
            if not actual_doc:
                raise DoesNotExist("Zombie DBRef detected")
            return actual_doc

        # If it's a Document/Proxy, ensure it's loaded
        if hasattr(ref, 'reload'):
            ref.reload()
        elif hasattr(ref, 'pk'):
            # Accessing pk usually doesn't trigger load, but reloading is safer
            # If reload isn't available, accessing a field might help
            _ = ref.pk

        return ref

    except (DoesNotExist, Exception) as e:
        print(
            f"Caught exception in get_safe_reference: {type(e).__name__}: {e}")
        # Zombie reference

        # Check if field is required - if so, we must delete the parent doc as it's invalid
        field = parent_doc._fields.get(field_name)
        if field and field.required:
            parent_doc.delete()
            print(f"Self-healed: Deleted orphan {parent_doc.__class__.__name__} {parent_doc.id} "
                  f"because {field_name} is required")
        else:
            setattr(parent_doc, field_name, None)
            parent_doc.save()
            print(f"Self-healed {parent_doc.__class__.__name__} {parent_doc.id}: "
                  f"Nullified dangling reference {field_name}")

        return None
