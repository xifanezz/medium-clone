import { Link, useNavigate } from "react-router-dom";
import { User } from "../types";
import { UserAvatar } from "./Avatar";
import medium from '../assets/medium.png';
import { ArrowLeft, LogOut } from "lucide-react";
import { supabase } from "../supabaseClient";

export interface ActionButtonProps {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: 'primary' | 'success' | 'secondary';
}

export interface IconButtonProps {
  'aria-label': string;
  onClick: () => void;
  icon: React.ReactNode;
  disabled?: boolean;
}

export interface HeaderProps {
  user: User | null;
  isLoading?: boolean;
  actionButtons?: ActionButtonProps[];
  iconButtons?: IconButtonProps[];
  sticky?: boolean;
  shadow?: boolean;
  border?: boolean;
  leftContent?: React.ReactNode; // Added back for flexibility
}

export function Header({
  user,
  isLoading = false,
  actionButtons = [],
  iconButtons = [],
  sticky = false,
  shadow = false,
  border = true,
  leftContent,
}: HeaderProps): JSX.Element {
  const navigate = useNavigate();

  const buttonVariants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-400',
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
  };

  return (
    <header
      className={`
        flex items-center justify-between bg-white p-4
        ${sticky ? 'sticky top-0 z-50' : ''}
        ${shadow ? 'shadow-sm' : ''}
        ${border ? 'border-b border-gray-200' : ''}
      `}
    >
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <Link to="/blogs" aria-label="Go to homepage">
          <img className="h-8" alt="Logo" src={medium} />
        </Link>
        {leftContent}
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {actionButtons.map((button, index) => (
          <button
            key={`action-${index}`}
            onClick={button.onClick}
            disabled={button.disabled || button.isLoading}
            className={`flex items-center gap-2 text-sm font-medium rounded-full px-4 py-2 transition-colors ${buttonVariants[button.variant || 'secondary']}`}
            aria-label={button.label}
          >
            {button.isLoading ? <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> : button.icon}
            <span>{button.isLoading ? 'Loading...' : button.label}</span>
          </button>
        ))}
        {iconButtons.map((button, index) => (
          <button
            key={`icon-${index}`}
            onClick={button.onClick}
            disabled={button.disabled}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
            aria-label={button['aria-label']}
          >
            {button.icon}
          </button>
        ))}
        {isLoading ? (
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        ) : user ? (
          <>
            <button
              onClick={() => navigate('/profile')}
              className="rounded-full"
              aria-label="View your profile"
            >
              <UserAvatar user={user} size={40} />
            </button>
            <button onClick={handleSignOut} className="p-2 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Sign out">
              <LogOut size={20} />
            </button>
          </>
        ) : (
          <button onClick={() => navigate('/signin')} className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
