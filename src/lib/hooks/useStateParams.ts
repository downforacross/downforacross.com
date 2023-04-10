import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

function useStateParams<T>(
    initialState: T,
    paramsName: string,
    serialize: (state: T) => string,
    deserialize: (state: string) => T
): [T, (state: T) => void]{

    const history = useHistory();
    const search = new URLSearchParams(history.location.search);

    const existingValue = search.get(paramsName);
    const [state, setState] = useState<T>(
        existingValue ? deserialize(existingValue) : initialState
    );

    useEffect(() => {
        // Updates state when user navigates backwards or forwards in browser history
        if (existingValue && deserialize(existingValue) !== state) {
            setState(deserialize(existingValue));
        }
    }, [existingValue]);

    const onChange = (s: T) => {
        setState(s);
        const searchParams = new URLSearchParams(history.location.search);
        searchParams.set(paramsName, serialize(s));
        const pathname = history.location.pathname;
        history.push({ pathname, search: searchParams.toString() });
    };

    return [state, onChange];
}

export default useStateParams