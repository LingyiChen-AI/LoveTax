import { Html, Head, Body, Container, Heading, Text, Button } from '@react-email/components';

export interface InviteProps {
  inviterName: string;
  acceptUrl: string;
  expiresInDays: number;
}

export default function InviteTpl({ inviterName, acceptUrl, expiresInDays }: InviteProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: '-apple-system, system-ui, sans-serif', backgroundColor: '#FFFFFF', padding: 24, margin: 0 }}>
        <Container style={{ background: '#FFFFFF', borderRadius: 16, padding: 4, maxWidth: 480 }}>
          <Heading style={{ margin: 0, fontSize: 20, color: '#1C1C1E', fontWeight: 600 }}>{`${inviterName} 邀请你加入 LoveTax`}</Heading>
          <Text style={{ marginTop: 12, fontSize: 14, color: '#3C3C43', lineHeight: 1.6 }}>LoveTax 是给情侣的扣分小工具。每天 100 分,Ta 不满意时扣你的分,开心时给你加分。</Text>
          <Button href={acceptUrl} style={{ marginTop: 16, background: '#34C759', color: '#FFFFFF', padding: '12px 20px', borderRadius: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>接受邀请</Button>
          <Text style={{ marginTop: 14, color: '#8E8E93', fontSize: 12 }}>{`链接在 ${expiresInDays} 天内有效。`}</Text>
        </Container>
      </Body>
    </Html>
  );
}
