import { Html, Head, Body, Container, Heading, Text, Section } from '@react-email/components';

export interface PasswordCodeProps {
  appUrl: string;
  email: string;
  code: string;
  ttlMinutes: number;
}

export default function PasswordCode({ appUrl, email, code, ttlMinutes }: PasswordCodeProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: '-apple-system, system-ui, sans-serif', backgroundColor: '#FFFFFF', padding: 24, margin: 0 }}>
        <Container style={{ background: '#FFFFFF', borderRadius: 16, padding: 4, maxWidth: 480 }}>
          <Heading style={{ margin: 0, fontSize: 20, color: '#1C1C1E', fontWeight: 600 }}>修改密码验证码</Heading>
          <Section style={{ marginTop: 14, padding: 14, background: '#F2F2F7', borderRadius: 14 }}>
            <Text style={{ margin: 0, color: '#8E8E93', fontSize: 12, fontWeight: 500 }}>账号</Text>
            <Text style={{ margin: '4px 0 0', fontSize: 15, color: '#1C1C1E', fontWeight: 500 }}>{email}</Text>
          </Section>
          <Section style={{ marginTop: 12, padding: 18, background: '#F2F2F7', borderRadius: 14, textAlign: 'center' as const }}>
            <Text style={{ margin: 0, color: '#8E8E93', fontSize: 12, fontWeight: 500 }}>验证码</Text>
            <Text style={{ margin: '8px 0 0', fontFamily: 'SF Mono, monospace', fontSize: 36, color: '#34C759', fontWeight: 700, letterSpacing: 6 }}>{code}</Text>
          </Section>
          <Text style={{ marginTop: 14, fontSize: 14, color: '#3C3C43' }}>{`验证码在 ${ttlMinutes} 分钟内有效。请回到 LoveTax 输入完成修改。`}</Text>
          <Text style={{ marginTop: 8, color: '#8E8E93', fontSize: 12 }}>{`如果不是你本人操作,请忽略本邮件并立即检查账号安全。登录:${appUrl}/login`}</Text>
        </Container>
      </Body>
    </Html>
  );
}
