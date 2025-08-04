// src/layouts/HeaderLayout.tsx
import { Link, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { supabase } from "./supabaseClient";
import medium from '../assets/medium.png';
import { ArrowLeft, LogOut, Pencil, Plus, Send } from "lucide-react";
import { UserAvatar } from "./component/Avatar";
import { User } from "./types";
import { api } from "./api";
import { useEffect, useState } from "react";
import { PageActionProvider, usePageAction } from "./PageActionContext";

const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const { user: currentUser, isLoading: isAuthLoading } = useAuth();
  // Get the saving state and action from context
  const { isSaving, executeSaveAction } = usePageAction();
  
  const [isAuthor, setIsAuthor] = useState(false);
  const [isCheckingAuthor, setIsCheckingAuthor] = useState(false);

  useEffect(() => {
    const checkAuthor = async () => {
      const postId = params.id;
      const username = currentUser?.user_metadata.username || currentUser?.email?.split("@")[0];//#TODO if the database trigger changes to form another type of default username from email. Changes are needed here too
      if (location.pathname.startsWith('/blog/') && postId && username) {
        setIsCheckingAuthor(true);
        try {
          const post = await api.getPostById(Number(postId));
          setIsAuthor(post.author.username === username);
        } catch (error) {
          console.error("Failed to check post author:", error);
          setIsAuthor(false);
        } finally {
          setIsCheckingAuthor(false);
        }
      } else {
        setIsAuthor(false);
      }
    };
    checkAuthor();
  }, [location.pathname, params.id, currentUser]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
  };

  const mappedUser = currentUser ? {
    username: currentUser?.user_metadata.username || currentUser?.email?.split("@")[0],//#TODO if the database trigger changes to form another type of default username from email. Changes are needed here too
    displayName: currentUser.user_metadata.full_name || currentUser.user_metadata.name,
    avatar: currentUser.user_metadata.avatar_url,
  } : null;

  const renderActionButtons = () => {
    if (isAuthLoading || location.pathname === '/signin' || location.pathname === '/signup') return null;

    const buttonClasses = "flex items-center gap-2 text-sm font-medium rounded-full px-4 py-2 transition-colors disabled:opacity-50";

    if (location.pathname.startsWith('/edit/')) {
      return (
        <button onClick={executeSaveAction} disabled={isSaving} className={`${buttonClasses} bg-green-600 text-white hover:bg-green-700`}>
          {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send size={16} />}
          <span>{isSaving ? 'Publishing...' : 'Publish Changes'}</span>
        </button>
      );
    }
    
    if (location.pathname === '/publish') {
       return (
        <button onClick={executeSaveAction} disabled={isSaving} className={`${buttonClasses} bg-green-600 text-white hover:bg-green-700`}>
          {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Plus size={16} />}
          <span>{isSaving ? 'Publishing...' : 'Publish'}</span>
        </button>
      );
    }

    if (currentUser && isAuthor && !isCheckingAuthor) {
      return (
        <>
          <button onClick={() => navigate(`/edit/${params.id}`)} className={`${buttonClasses} bg-gray-100 text-gray-800 hover:bg-gray-200`}>
            <Pencil size={16} /><span>Edit Post</span>
          </button>
          <button onClick={() => navigate('/publish')} className={`${buttonClasses} bg-green-600 text-white hover:bg-green-700`}>
            <Plus size={16} /><span>Write</span>
          </button>
        </>
      );
    }

    if (currentUser) {
      return (
        <button onClick={() => navigate('/publish')} className={`${buttonClasses} bg-green-600 text-white hover:bg-green-700`}>
          <Plus size={16} /><span>Write</span>
        </button>
      );
    }
    
    return null;
  };

  return (
    <header className="flex items-center justify-between bg-white p-4 sticky top-0 z-50 border-b border-gray-200">
      <div className="flex items-center space-x-4">
        {location.pathname !== '/blogs' && (
          <button onClick={() => navigate(-1)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
        )}
        <Link to="/blogs" aria-label="Go to homepage"><img className="h-8" alt="Logo" src={medium} /></Link>
      </div>
      <div className="flex items-center space-x-4">
        {renderActionButtons()}
        {isAuthLoading ? <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        : mappedUser ? (
          <>
            <button onClick={() => navigate(`/profile/${mappedUser.username}`)} className="rounded-full" aria-label="View your profile">
              <UserAvatar user={mappedUser as User} size={40} />
            </button>
            <button onClick={handleSignOut} className="p-2 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Sign out">
              <LogOut size={20} />
            </button>
          </>
        ) : (
          location.pathname !== '/signin' && location.pathname !== '/signup' && (
            <button onClick={() => navigate('/signin')} className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign In</button>
          )
        )}
      </div>
    </header>
  );
};

export const HeaderLayout = () => {
  return (
    <PageActionProvider>
      <AppHeader />
      <main>
        <Outlet />
      </main>
    </PageActionProvider>
  );
};
