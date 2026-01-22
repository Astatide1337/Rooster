import { createContext, useContext } from 'react'

export const ActionContext = createContext({
    actions: [],
    registerAction: () => { },
    unregisterAction: () => { },
    triggerAction: () => { }
})

export function useActions() {
    return useContext(ActionContext)
}
