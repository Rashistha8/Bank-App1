import { useState } from 'react';
import { Card, Form, Input, Button, Typography, Alert, Tabs, Avatar, Statistic, message, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useAuth } from '../../provider/AuthContextProvider';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const profileSchema = Yup.object({
  firstName: Yup.string().min(2).required('First name is required'),
  lastName: Yup.string().min(2).required('Last name is required'),
  phone: Yup.string().matches(/^[0-9]{10}$/, 'Phone must be 10 digits').notRequired(),
  address: Yup.string().notRequired(),
});

const passwordSchema = Yup.object({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string().min(8).required('New password is required'),
  confirmPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'Passwords do not match').required(),
});

export default function Profile() {
  const { user, account, updateProfile, changePassword } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);

  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
    setError: setProfileError,
    reset: resetProfile,
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      address: user?.address || '',
    },
  });

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
    setError: setPasswordError,
    reset: resetPassword,
  } = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onProfileSubmit = async (data) => {
    try {
      await updateProfile(data);
      message.success('Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      setProfileError('root', { type: 'manual', message: err.message || 'Failed to update profile' });
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await changePassword(data.currentPassword, data.newPassword);
      message.success('Password changed successfully');
      setPasswordMode(false);
      resetPassword();
    } catch (err) {
      setPasswordError('root', { type: 'manual', message: err.message || 'Failed to change password' });
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card style={{ textAlign: 'center', borderRadius: 16, marginBottom: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Avatar size={100} icon={<UserOutlined />} />
        <Title level={3} style={{ marginTop: 12 }}>{user?.firstName} {user?.lastName}</Title>
        <Row gutter={16} justify="center" style={{ marginTop: 16 }}>
          <Col>
            <Statistic title="Account Balance" value={`$${(account?.balance || 0).toLocaleString()}`} />
          </Col>
          <Col>
            <Statistic title="Account Number" value={account?.accountNumber || '-'} />
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Personal Info" key="1">
            {editMode ? (
              <Form layout="vertical" onFinish={handleProfileSubmit(onProfileSubmit)}>
                {profileErrors.root && <Alert type="error" message={profileErrors.root.message} showIcon style={{ marginBottom: 16 }} />}
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="First Name" validateStatus={profileErrors.firstName ? 'error' : ''} help={profileErrors.firstName?.message}>
                      <Controller name="firstName" control={profileControl} render={({ field }) => <Input {...field} />} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Last Name" validateStatus={profileErrors.lastName ? 'error' : ''} help={profileErrors.lastName?.message}>
                      <Controller name="lastName" control={profileControl} render={({ field }) => <Input {...field} />} />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item label="Phone" validateStatus={profileErrors.phone ? 'error' : ''} help={profileErrors.phone?.message}>
                  <Controller name="phone" control={profileControl} render={({ field }) => <Input {...field} placeholder="10-digit phone number" />} />
                </Form.Item>
                <Form.Item label="Address" validateStatus={profileErrors.address ? 'error' : ''} help={profileErrors.address?.message}>
                  <Controller name="address" control={profileControl} render={({ field }) => <Input {...field} />} />
                </Form.Item>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={profileSubmitting}>Save</Button>
                  <Button onClick={() => { resetProfile(); setEditMode(false); }}>Cancel</Button>
                </div>
              </Form>
            ) : (
              <div>
                <Text strong>First Name:</Text> {user?.firstName} <br/>
                <Text strong>Last Name:</Text> {user?.lastName} <br/>
                <Text strong>Email:</Text> {user?.email} <br/>
                <Text strong>Phone:</Text> {user?.phone || '-'} <br/>
                <Text strong>Address:</Text> {user?.address || '-'} <br/>
                <Button type="link" onClick={() => setEditMode(true)} style={{ marginTop: 12 }}>Edit Info</Button>
              </div>
            )}
          </TabPane>

          <TabPane tab="Security" key="2">
            {passwordMode ? (
              <Form layout="vertical" onFinish={handlePasswordSubmit(onPasswordSubmit)}>
                {passwordErrors.root && <Alert type="error" message={passwordErrors.root.message} showIcon style={{ marginBottom: 16 }} />}
                <Form.Item label="Current Password" validateStatus={passwordErrors.currentPassword ? 'error' : ''} help={passwordErrors.currentPassword?.message}>
                  <Controller name="currentPassword" control={passwordControl} render={({ field }) => <Input.Password {...field} />} />
                </Form.Item>
                <Form.Item label="New Password" validateStatus={passwordErrors.newPassword ? 'error' : ''} help={passwordErrors.newPassword?.message}>
                  <Controller name="newPassword" control={passwordControl} render={({ field }) => <Input.Password {...field} />} />
                </Form.Item>
                <Form.Item label="Confirm New Password" validateStatus={passwordErrors.confirmPassword ? 'error' : ''} help={passwordErrors.confirmPassword?.message}>
                  <Controller name="confirmPassword" control={passwordControl} render={({ field }) => <Input.Password {...field} />} />
                </Form.Item>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button type="primary" htmlType="submit" loading={passwordSubmitting}>Change Password</Button>
                  <Button onClick={() => { resetPassword(); setPasswordMode(false); }}>Cancel</Button>
                </div>
              </Form>
            ) : (
              <div>
                <Text type="secondary">Keep your account secure by using a strong password.</Text>
                <div style={{ marginTop: 16 }}>
                  <Button onClick={() => setPasswordMode(true)}>Change Password</Button>
                </div>
              </div>
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}
