import { Html, Head, Body, Container, Heading, Text } from '@react-email/components';

export interface PWProps {
  appUrl: string;
  email: string;
  tempPassword: string;
}

export default function PWReset({ appUrl, email, tempPassword }: PWProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#FEF3C7', padding: 24 }}>
        <Container style={{ background: '#fff', border: '2.5px solid #1F2937', borderRadius: 14, padding: 20, maxWidth: 480 }}>
          <Heading style={{ margin: 0, fontSize: 20 }}>临时密码</Heading>
          <Text>账号:{email}</Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 18, background: '#FEF3C7', padding: 10, borderRadius: 8 }}>{tempPassword}</Text>
          <Text>登录后请立即修改密码。</Text>
          <Text style={{ color: '#6B7280', fontSize: 12 }}>登录:{appUrl}/login</Text>
        </Container>
      </Body>
    </Html>
  );
}
