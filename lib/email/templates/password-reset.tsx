import { Html, Head, Body, Container, Heading, Text, Section } from '@react-email/components';

export interface PWProps {
  appUrl: string;
  email: string;
  tempPassword: string;
}

export default function PWReset({ appUrl, email, tempPassword }: PWProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#FFE6F4', padding: 24 }}>
        <Container style={{ background: '#FFFFFF', border: '2px solid #FFCDE8', borderRadius: 18, padding: 24, maxWidth: 480, boxShadow: '3px 3px 0 #FFB6E6' }}>
          <Heading style={{ margin: 0, fontSize: 20, color: '#5B3A8A' }}>🔑 临时密码</Heading>
          <Section style={{ marginTop: 14 }}>
            <Text style={{ margin: 0, color: '#B891D1', fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700 }}>账号</Text>
            <Text style={{ margin: '4px 0 0', fontSize: 14, color: '#5B3A8A', fontWeight: 700 }}>{email}</Text>
          </Section>
          <Section style={{ marginTop: 14, padding: 14, background: '#FFEDF6', borderRadius: 14, border: '1.5px solid #FFCDE8' }}>
            <Text style={{ margin: 0, color: '#B891D1', fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700 }}>临时密码</Text>
            <Text style={{ margin: '4px 0 0', fontFamily: 'monospace', fontSize: 18, color: '#FF6FB5', fontWeight: 800, letterSpacing: 1 }}>{tempPassword}</Text>
          </Section>
          <Text style={{ marginTop: 12, fontSize: 14, color: '#5B3A8A' }}>登录后请立即修改密码。</Text>
          <Text style={{ marginTop: 8, color: '#B891D1', fontSize: 12 }}>{`登录:${appUrl}/login`}</Text>
        </Container>
      </Body>
    </Html>
  );
}
