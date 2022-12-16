import { useNavigate } from 'react-router';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';


function App() {
    const navigate = useNavigate();

    return (
        <Stack
            direction="row"
            spacing={{ xs: 2, md: 3 }}>
            <Button
                variant="contained"
                onClick={() => navigate("/mint")}
                fullWidth>
                Mint tokens
            </Button>
            <Button
                variant="contained"
                onClick={() => navigate("/list")}
                fullWidth>
                List owned
            </Button>
        </Stack>
    );
}

export default App;
