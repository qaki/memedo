import { Card } from '../../components/ui/Card';
import { LoginForm } from '../../components/auth/LoginForm';

const Login = () => {
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-600 mt-2">Login to your MemeDo account</p>
        </div>
        <LoginForm />
      </Card>
    </div>
  );
};

export default Login;
