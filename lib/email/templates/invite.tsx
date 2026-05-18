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
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#FEF3C7', padding: 24 }}>
        <Container style={{ background: '#fff', border: '2.5px solid #1F2937', borderRadius: 14, padding: 20, maxWidth: 480 }}>
          <Heading style={{ margin: 0, fontSize: 20 }}>{inviterName} 邀请你加入 LoveTax</Heading>
          <Text>LoveTax(爱情税)是给情侣的扣分小工具。每天 100 分,Ta 不满意时扣你的分。</Text>
          <Button href={acceptUrl} style={{ background: '#FBBF24', padding: '12px 16px', borderRadius: 12, border: '2.5px solid #1F2937', fontWeight: 800, color: '#1F2937', textDecoration: 'none' }}>接受邀请</Button>
          <Text style={{ color: '#6B7280', fontSize: 12 }}>{`链接在 ${expiresInDays} 天内有效。`}</Text>
        </Container>
      </Body>
    </Html>
  );
}
