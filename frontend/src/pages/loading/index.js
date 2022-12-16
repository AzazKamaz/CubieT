import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { address } from '../../web3api';


function App() {
  const navigate = useNavigate();

  useEffect(() => {
    address
      .then(() => navigate('/menu'));
  }, [navigate]);

  return (
    <div>Connecting to MetaMask...</div>
  );
}

export default App;
