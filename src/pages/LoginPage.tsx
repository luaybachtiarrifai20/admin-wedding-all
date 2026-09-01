import { Login } from '../components/Login';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  return <Login onLogin={onLogin} />;
};
