import { useState, useRef, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { RiDashboardLine, RiLogoutBoxLine, RiMessage2Line } from "react-icons/ri";
import { CgProfile } from "react-icons/cg";
import { IoMdSettings } from "react-icons/io";

const ProfileMenu = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const router = useRouter();
  const [userRole, setUserRole] = useState("member"); // default fallback

  useEffect(() => {
    const storedRole = sessionStorage.getItem("role");
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const basePath = `/${userRole}`;

  const menuItems = [
    { 
      icon: <RiDashboardLine className="w-5 h-5" />, 
      label: 'Dashboard', 
      action: () => router.push(`${basePath}/dashboard`)
    },
    { 
      icon: <CgProfile className="w-5 h-5" />, 
      label: 'My Profile', 
      action: () => router.push(`${basePath}/profile`)
    },
    {
      icon: <RiMessage2Line className="w-5 h-5" />,
      label: 'Chat',
      action: () => router.push(`${basePath}/chat`)
    },
    { 
      icon: <IoMdSettings className="w-5 h-5" />, 
      label: 'Settings', 
      action: () => router.push(`${basePath}/settings`)
    },
    { 
      icon: <RiLogoutBoxLine className="w-5 h-5" />, 
      label: 'Logout', 
      action: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
          router.push('/');
        } catch (error) {
          console.error('Logout failed:', error);
        }
      }
    },
  ];

  return (
    <div className="relative" ref={profileMenuRef}>
      <button
        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
        className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors overflow-hidden"
      >
        <img
          src="/profile_icon.png"
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover"
        />
      </button>

      {isProfileMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-200">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.action();
                setIsProfileMenuOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2 transition-colors"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
