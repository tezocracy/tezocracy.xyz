import { createContext } from 'react';
import { UserData } from '../../types';

const defaultUserContext: UserData = {
    address: undefined,
    balance: undefined,
    isDelegate: undefined
}

export const UserContext = createContext({ userData: defaultUserContext, setUserData: undefined });