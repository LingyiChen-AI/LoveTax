import { Html, Head, Body, Container, Heading, Text, Button } from '@react-email/components';

export interface BonusVoidProps {
  appUrl: string;
  fromName: string;
  toName: string;
  points: number;
  reason: string;
  remaining: number;
}

export default function BonusVoid({ appUrl, fromName, toName, points, reason, remaining }: BonusVoidProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#E0F4FF', padding: 24 }}>
        <Container style={{ background: '#fff', border: '2.5px solid #5B3A8A', borderRadius: 14, padding: 20, maxWidth: 480 }}>
          <Heading style={{ margin: 0, fontSize: 20 }}>{toName},{fromName} 撤销了一次夸奖</Heading>
          <Text>{`撤销内容: +${points} · ${reason}`}</Text>
          <Text style={{ fontSize: 24, color: '#FF6FB5', fontWeight: 800 }}>{`你今日剩余 ${remaining}/100`}</Text>
          <Button href={appUrl} style={{ background: '#6FB8FF', padding: '12px 16px', borderRadius: 12, border: '2.5px solid #5B3A8A', fontWeight: 800, color: '#FFFFFF', textDecoration: 'none' }}>打开 LoveTax</Button>
        </Container>
      </Body>
    </Html>
  );
}
