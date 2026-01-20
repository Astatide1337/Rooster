# Gunicorn configuration for production
# See: https://docs.gunicorn.org/en/stable/settings.html

import multiprocessing

# Bind to all interfaces on port 5000
bind = "0.0.0.0:5000"

# Worker configuration
# Formula: (2 * CPU cores) + 1
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
threads = 2

# Timeouts
timeout = 30
keepalive = 2
graceful_timeout = 30

# Logging
accesslog = "-"  # stdout
errorlog = "-"   # stderr
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Security
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190

# Process naming
proc_name = "rooster-api"
