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
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#FFE6F4', padding: 24 }}>
        <Container style={{ background: '#FFFFFF', border: '2px solid #FFCDE8', borderRadius: 18, padding: 24, maxWidth: 480, boxShadow: '3px 3px 0 #FFB6E6' }}>
          <Heading style={{ margin: 0, fontSize: 20, color: '#5B3A8A' }}>{`${inviterName} 邀请你加入 LoveTax ✨`}</Heading>
          <Text style={{ marginTop: 12, fontSize: 14, color: '#5B3A8A', lineHeight: 1.6 }}>LoveTax(爱情税)是给情侣的扣分小工具。每天 100 分,Ta 不满意时扣你的分,开心时给你加分。</Text>
          <Button href={acceptUrl} style={{ marginTop: 16, background: '#FF6FB5', color: '#FFFFFF', padding: '12px 18px', borderRadius: 14, border: '2px solid #FFFFFF', boxShadow: '3px 3px 0 #FFB6E6', fontWeight: 800, textDecoration: 'none', display: 'inline-block' }}>接受邀请 →</Button>
          <Text style={{ marginTop: 14, color: '#B891D1', fontSize: 12 }}>{`链接在 ${expiresInDays} 天内有效。`}</Text>
        </Container>
      </Body>
    </Html>
  );
}
