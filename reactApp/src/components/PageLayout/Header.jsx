import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { Button } from '../Button/Button';
import { StyleHeader } from './Layout.styles';

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // Derived from the URL instead of mirrored into state
  const activeComponent = pathname.startsWith('/students') ? 'students' : 'classes';

  return (
    <header>
      <StyleHeader>
        <div>
          <Button
            className={`mr-2 ${activeComponent === 'classes' ? 'active' : ''}`}
            onClick={() => navigate('/classes')}
          >
            {'Classes'}
          </Button>
          <Button
            className={activeComponent === 'students' ? 'active' : ''}
            onClick={() => navigate('/students')}
          >
            {'All Students'}
          </Button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="text-muted">{user?.email}</span>
          <Button buttonType="danger" onClick={signOut} dataTestSpecifier="logoutButton">
            {'Log out'}
          </Button>
        </div>
      </StyleHeader>

      {/* Add styles */}
      <style>
        {`
          .active {
            background-color: #007bff;
            color: white;
          }
        `}
      </style>
    </header>
  );
};
