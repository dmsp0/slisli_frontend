import { useEffect } from 'react';

const AuthKakao = () => {
  useEffect(() => {
    fetch('/auth/kakao', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // 쿠키를 포함하도록 설정
    })
    .then(response => response.json())
    .then(data => {
      if (data.url) {
        console.log('Redirecting to:', data.url); // 리디렉션 URL 로그 추가
        window.location.href = data.url; // 직접 리디렉션
      } else {
        console.error('Failed to get redirect URL');
      }
    })
    .catch(error => console.error('Fetch error:', error)); // 에러 로그 추가
  }, []);

  return <div>Redirecting to Kakao...</div>;
}

export default AuthKakao;