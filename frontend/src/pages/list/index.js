import { useEffect, useReducer, useState } from 'react';

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


import { address, cubiet } from '../../web3api';


function App() {
    const [refresh, setRefresh] = useReducer((state, patch) => state + patch, 0);
    const [list, setList] = useState({});
    const [metadata, setMetadata] = useReducer((state, patch) => ({ ...state, ...patch }), {});
    const [selected, setSelected] = useReducer((state, patch) => ({ ...state, ...patch }), { 'a': null, 'b': null });
    const [dialog, setDialog] = useState(false);

    useEffect(() => {
        (async () => {
            const _data = await (await cubiet)['tokensOfOwner'](await address);
            const data = Object.fromEntries(_data.map(a => [a.tokenId.toString(), a]));
            setList(data);

            for (const [key, val] of Object.entries(data)) {
                fetch(val.tokenUri).then(res => res.json()).then(meta => setMetadata({ [key]: meta }));
            }
        })();
    }, [refresh]);

    useEffect(() => {
        if (selected.a && selected.b) {
            setDialog(true);
        }
    }, [selected]);

    const join = async () => {
        try {
            const tx = await (await cubiet)['produce'](
                await address,
                selected.a,
                selected.b,
            );
            console.log(tx);
            const res = await tx.wait();
            console.log(res);
            setSelected({ a: null, b: null });
            setRefresh(1);
            setDialog(false);
        } catch (e) {
            console.log(e);
            alert(e);
        }
    };

    // const mint = async (key) => {
    //     const data = mintlist[key];
    //     try {
    //         console.log(Buffer.from(data.cube, 'base64'))
    //         const tx = await (await cubiet)['mint'](
    //             await address,
    //             key,
    //             Buffer.from(data.cube, 'base64'),
    //             Buffer.from(data.sign, 'base64'),
    //         );
    //         console.log(tx);
    //         const res = await tx.wait();
    //         console.log(res);
    //         setMintable({ [key]: false });
    //     } catch (e) {
    //         console.log(e);
    //         alert(e);
    //     }
    // };

    const dislist = Object.entries(list).map(([key, val]) => {
        const meta = metadata[key];

        if (!meta) {
            return <Grid item xs={4} key={key}><Card></Card></Grid>
        }

        return <Grid item xs={4} key={key}>
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
                        color={selected.a === key ? "success" : "primary"}
                        onClick={() => setSelected({ a: selected.a === key ? null : key })}
                        fullWidth>
                        Use as a
                    </Button>
                    <Button
                        variant="contained"
                        color={selected.b === key ? "success" : "primary"}
                        onClick={() => setSelected({ b: selected.b === key ? null : key })}
                        fullWidth>
                        Use as b
                    </Button>
                </CardActions>
            </Card>
        </Grid>
    });

    return (
        <>
            <Grid
                container
                spacing={{ xs: 2, md: 3 }}>
                {dislist}
            </Grid>

            <Dialog
                open={dialog}
                onClose={() => setDialog(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Combining Cubies"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Combine Cubie #{selected.a && selected.a.padStart(3, '0')} and Cubie #{selected.b && selected.b.padStart(3, '0')}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialog(false)}>Do nothing</Button>
                    <Button onClick={() => join()} autoFocus>Combine</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default App;
