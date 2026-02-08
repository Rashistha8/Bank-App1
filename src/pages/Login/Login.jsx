import React from 'react';
import { Form, Input, Button, Alert, Typography } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../provider/AuthContextProvider';
import { useNavigate } from 'react-router';
import './Login.css';

const { Title, Text } = Typography;

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err) {
      // If error is "Invalid email or password", navigate to signup
      if (err.message === 'Invalid email or password') {
        navigate('/signup', { state: { email: data.email } });
      } else {
        setError('root', {
          type: 'manual',
          message: err.message || 'Login failed',
        });
      }
    }
  };

  return (
    <Form
      layout="vertical"
      onFinish={handleSubmit(onSubmit)}
      style={{ maxWidth: 400, margin: '40px auto' }}
    >
      <Title level={3}>Login</Title>

      {errors.root && (
        <Alert
          type="error"
          message={errors.root.message}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Email */}
      <Form.Item
        label="Email"
        validateStatus={errors.email ? 'error' : ''}
        help={errors.email?.message}
      >
        <Controller
          name="email"
          control={control}
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Invalid email address',
            },
          }}
          render={({ field }) => <Input {...field} placeholder="Enter your email" />}
        />
      </Form.Item>

      {/* Password */}
      <Form.Item
        label="Password"
        validateStatus={errors.password ? 'error' : ''}
        help={errors.password?.message}
      >
        <Controller
          name="password"
          control={control}
          rules={{
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          }}
          render={({ field }) => <Input.Password {...field} placeholder="Enter your password" />}
        />
      </Form.Item>

      <Button type="primary" htmlType="submit" loading={isSubmitting} block size="large">
        Login
      </Button>

      <Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
        Test accounts: admin@test.com / password OR useradmin@test.com/ password
      </Text>

      <Text
        type="secondary"
        style={{ display: 'block', marginTop: 8, cursor: 'pointer', color: '#1890ff' }}
        onClick={() => navigate('/signup')}
      >
        Don't have an account? Sign up here.
      </Text>
    </Form>
  );
}

export default Login;
