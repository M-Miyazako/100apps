import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { App, LauncherState } from '../types/app';
import { sampleApps } from '../data/sampleApps';

type AppAction =
  | { type: 'SET_APPS'; payload: App[] }
  | { type: 'ADD_APP'; payload: App }
  | { type: 'UPDATE_APP'; payload: App }
  | { type: 'DELETE_APP'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_CATEGORY'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: LauncherState = {
  apps: [],
  categories: [
    { id: 'utility', name: 'ユーティリティ', color: '#2196F3' },
    { id: 'game', name: 'ゲーム', color: '#4CAF50' },
    { id: 'productivity', name: '生産性', color: '#FF9800' },
    { id: 'entertainment', name: 'エンターテイメント', color: '#E91E63' },
    { id: 'tool', name: 'ツール', color: '#607D8B' },
  ],
  searchQuery: '',
  selectedCategory: null,
  isLoading: false,
};

const appReducer = (state: LauncherState, action: AppAction): LauncherState => {
  switch (action.type) {
    case 'SET_APPS':
      return { ...state, apps: action.payload };
    case 'ADD_APP':
      return { ...state, apps: [...state.apps, action.payload] };
    case 'UPDATE_APP':
      return {
        ...state,
        apps: state.apps.map(app =>
          app.id === action.payload.id ? action.payload : app
        ),
      };
    case 'DELETE_APP':
      return {
        ...state,
        apps: state.apps.filter(app => app.id !== action.payload),
      };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: LauncherState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const loadApps = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        // 開発中は常にサンプルデータを使用
        localStorage.removeItem('launcher-apps');
        dispatch({ type: 'SET_APPS', payload: sampleApps });
      } catch (error) {
        console.error('Failed to load apps:', error);
        // エラーの場合もサンプルデータを使用
        dispatch({ type: 'SET_APPS', payload: sampleApps });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadApps();
  }, []);

  useEffect(() => {
    localStorage.setItem('launcher-apps', JSON.stringify(state.apps));
  }, [state.apps]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};