export const metadata = {
  title: 'Feedback Board',
  description: 'Submit and view feedback',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ borderBottom: '2px solid #333', paddingBottom: '0.5rem' }}>
          Feedback Board
        </h1>
        {children}
      </body>
    </html>
  );
}
