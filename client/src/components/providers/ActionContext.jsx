import React, { createContext, useContext, useState, useCallback } from 'react'

const ActionContext = createContext({
    actions: [],
    registerAction: () => { },
    unregisterAction: () => { },
    triggerAction: () => { }
})

export function ActionProvider({ children }) {
    const [actions, setActions] = useState([])

    const registerAction = useCallback((id, label, icon, handler) => {
        setActions(prev => {
            // Prevent duplicates
            if (prev.find(a => a.id === id)) return prev
            return [...prev, { id, label, icon, handler }]
        })
    }, [])

    const unregisterAction = useCallback((id) => {
        setActions(prev => prev.filter(a => a.id !== id))
    }, [])

    const triggerAction = useCallback((id) => {
        const action = actions.find(a => a.id === id)
        if (action?.handler) action.handler()
    }, [actions])

    return (
        <ActionContext.Provider value={{ actions, registerAction, unregisterAction, triggerAction }}>
            {children}
        </ActionContext.Provider>
    )
}

export function useActions() {
    return useContext(ActionContext)
}
