import React from 'react';

export interface NavigationTabsProps {
  activeTab: 'home' | 'bookmarks';
  onTabChange: (tab: 'home' | 'bookmarks') => void;
  /** If true, the "Bookmarks" or "Saved" tab will be shown. Defaults to false. */
  showBookmarks?: boolean;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ 
  activeTab, 
  onTabChange, 
  showBookmarks = false 
}) => (
  <div className="border-b border-gray-200">
    <nav className="flex space-x-6 max-w-2xl px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => onTabChange('home')}
        className={`py-3 px-2 border-b-2 font-sans text-sm font-medium transition-colors ${
          activeTab === 'home'
            ? 'border-green-500 text-gray-900'
            : 'border-transparent text-gray-500 hover:text-green-500'
        }`}
      >
        Home
      </button>

      {/* The "Saved" tab is rendered conditionally */}
      {showBookmarks && (
        <button
          onClick={() => onTabChange('bookmarks')}
          className={`py-3 px-2 border-b-2 font-sans text-sm font-medium transition-colors ${
            activeTab === 'bookmarks'
              ? 'border-green-500 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-green-500'
          }`}
        >
          Saved
        </button>
      )}
    </nav>
  </div>
);
