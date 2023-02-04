import { sp } from '@pnp/sp';
import { useEffect, useState } from "react"

let cachedUser;

const useCurrentUser = () => {
    const [user, setUser]: any = useState({})

    useEffect(() => {
        if (!cachedUser) {
            (async () => {
                const curUser = await sp.web.currentUser()
                cachedUser = curUser
                setUser(curUser)
            })()
        } else {
            setUser(cachedUser)
        }

    }, [])
    return user
}

export default useCurrentUser