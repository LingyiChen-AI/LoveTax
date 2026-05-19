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
      <Body style={{ fontFamily: '-apple-system, system-ui, sans-serif', backgroundColor: '#FFFFFF', padding: 24, margin: 0 }}>
        <Container style={{ background: '#FFFFFF', borderRadius: 16, padding: 4, maxWidth: 480 }}>
          <Heading style={{ margin: 0, fontSize: 20, color: '#1C1C1E', fontWeight: 600 }}>临时密码</Heading>
          <Section style={{ marginTop: 14, padding: 14, background: '#F2F2F7', borderRadius: 14 }}>
            <Text style={{ margin: 0, color: '#8E8E93', fontSize: 12, fontWeight: 500 }}>账号</Text>
            <Text style={{ margin: '4px 0 0', fontSize: 15, color: '#1C1C1E', fontWeight: 500 }}>{email}</Text>
          </Section>
          <Section style={{ marginTop: 12, padding: 14, background: '#F2F2F7', borderRadius: 14 }}>
            <Text style={{ margin: 0, color: '#8E8E93', fontSize: 12, fontWeight: 500 }}>临时密码</Text>
            <Text style={{ margin: '4px 0 0', fontFamily: 'SF Mono, monospace', fontSize: 18, color: '#34C759', fontWeight: 600, letterSpacing: 1 }}>{tempPassword}</Text>
          </Section>
          <Text style={{ marginTop: 14, fontSize: 14, color: '#3C3C43' }}>登录后请立即修改密码。</Text>
          <Text style={{ marginTop: 8, color: '#8E8E93', fontSize: 12 }}>{`登录:${appUrl}/login`}</Text>
        </Container>
      </Body>
    </Html>
  );
}
