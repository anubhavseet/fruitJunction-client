import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useApolloClient } from '@apollo/client/react';
import { ME_QUERY, LOGIN_MUTATION, REGISTER_MUTATION, LOGOUT_MUTATION, REFRESH_TOKEN_MUTATION } from '../lib/graphql/queries';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const client = useApolloClient();

  // Fetch current user on mount
  const { data, loading: queryLoading, error, refetch: refetchMe } = useQuery(ME_QUERY, {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  });

  useEffect(() => {
    if (!queryLoading) {
      if (data?.me) {
        setUser(data.me);
      } else {
        setUser(null);
      }
      setLoading(false);
    }
  }, [data, queryLoading, error]);

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);
  const [refreshTokenMutation] = useMutation(REFRESH_TOKEN_MUTATION);

  const login = useCallback(async (email, password) => {
    const { data } = await loginMutation({
      variables: { input: { email, password } },
    });
    if (data?.login?.user) {
      setUser(data.login.user);
      setLoading(false);
      await client.resetStore();
    }
    return data?.login;
  }, [loginMutation, client]);

  const register = useCallback(async (input) => {
    const { data } = await registerMutation({
      variables: { input },
    });
    if (data?.register?.user) {
      setUser(data.register.user);
      setLoading(false);
      await client.resetStore();
    }
    return data?.register;
  }, [registerMutation, client]);

  const logout = useCallback(async () => {
    try {
      await logoutMutation();
    } catch (e) {
      // Ignore logout errors
    }
    setUser(null);
    setLoading(false);
    await client.clearStore();
  }, [logoutMutation, client]);

  const refreshToken = useCallback(async () => {
    try {
      const { data } = await refreshTokenMutation();
      if (data?.refreshToken?.user) {
        setUser(data.refreshToken.user);
      }
    } catch (e) {
      setUser(null);
    }
  }, [refreshTokenMutation]);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    refreshToken,
    refetchMe,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
