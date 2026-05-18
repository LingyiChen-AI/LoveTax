import { Html, Head, Body, Container, Heading, Text, Button } from '@react-email/components';

export interface VoidProps {
  appUrl: string;
  fromName: string;
  toName: string;
  points: number;
  reason: string;
  remaining: number;
}

export default function VoidTpl({ appUrl, fromName, toName, points, reason, remaining }: VoidProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#FEF3C7', padding: 24 }}>
        <Container style={{ background: '#fff', border: '2.5px solid #1F2937', borderRadius: 14, padding: 20, maxWidth: 480 }}>
          <Heading style={{ margin: 0, fontSize: 20 }}>{toName},{fromName} 撤销了一次扣分</Heading>
          <Text>撤销内容: -{points} · {reason}</Text>
          <Text style={{ fontSize: 24, color: '#10B981', fontWeight: 800 }}>{`你今日剩余 ${remaining}/100`}</Text>
          <Button href={appUrl} style={{ background: '#FBBF24', padding: '12px 16px', borderRadius: 12, border: '2.5px solid #1F2937', fontWeight: 800, color: '#1F2937', textDecoration: 'none' }}>打开 zchat</Button>
        </Container>
      </Body>
    </Html>
  );
}
