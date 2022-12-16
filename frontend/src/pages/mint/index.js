import { useEffect, useReducer, useState } from 'react';

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';


import { address, cubiet } from '../../web3api';
import { retry } from '../../utils';


function App() {
    const [mintlist, setMintlist] = useState({});
    const [mintable, setMintable] = useReducer((state, patch) => ({ ...state, ...patch }), {});
    const [metadata, setMetadata] = useReducer((state, patch) => ({ ...state, ...patch }), {});

    useEffect(() => {
        (async () => {
            const data = await (await retry('https://api.bdld.azazkamaz.me/mintlist')).json();
            setMintlist(data);

            for (const [key, val] of Object.entries(data)) {
                (await cubiet)['ownerOf']([parseInt(key)]).then((a) => {
                    ;
                }).catch((err) => {
                    if (err.reason === 'ERC721: invalid token ID') {
                        setMintable({ [key]: true });
                    } else {
                        console.log(err);
                    }
                });

                retry(val.link).then(res => res.json()).then(meta => setMetadata({ [key]: meta }));
            }
        })();
    }, []);

    const mint = async (key) => {
        const data = mintlist[key];
        try {
            console.log(Buffer.from(data.cube, 'base64'))
            const tx = await (await cubiet)['mint'](
                await address,
                key,
                Buffer.from(data.cube, 'base64'),
                Buffer.from(data.sign, 'base64'),
            );
            console.log(tx);
            const res = await tx.wait();
            console.log(res);
            setMintable({ [key]: false });
        } catch (e) {
            console.log(e);
            alert(e);
        }
    };

    const dislist = Object.entries(mintlist).map(([key, val]) => {
        const meta = metadata[key];

        if (!meta) {
            return <Grid item xs={4} key={key}><Card></Card></Grid>
        }

        return <Grid item xs={4} key={key}>
            {/* <div>{key} - {mintable[key] ? "yes" : "no"}</div> */}
            <Card>
                <CardMedia
                    component="img"
                    // height="140"
                    image={meta.image}
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        {meta.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {meta.description}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button
                        variant="contained"
                        disabled={!mintable[key]}
                        onClick={() => mint(key)}
                        fullWidth>
                        Mint
                    </Button>
                </CardActions>
            </Card>
        </Grid>
    });

    return (
        <Grid
            container
            spacing={{ xs: 2, md: 3 }}>
            {dislist}
        </Grid>
    );
}

export default App;
