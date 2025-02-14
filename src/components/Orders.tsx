import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import useSWR from "swr";
import type { Order } from "@/server/orders";
import axios from "axios";
import { useState } from "react";
import SaveIcon from "@mui/icons-material/Save";
import { Box } from "@mui/system";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export const Orders = () => {
  const [busy, setBusy] = useState(false);
  const { data: orders, mutate } = useSWR<Order[]>("/api/orders", fetcher);

  const charge = async (order: Order) => {
    setBusy(true);
    console.info("Charging order", order);
    const { data: charge } = await axios.post(`/api/orders/${order.id}/charge`);
    await mutate();
    console.info("Charge", charge);
    setBusy(false);
  };

  return (
    <Card>
      <CardHeader title="Orders" />
      <CardContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Token</TableCell>
              <TableCell>Card</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders?.map((order) => {
              const tokenOrIntent = order?.tokenIntent || order?.token;

              return (
                <TableRow
                  key={order.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Box display="flex">
                      <Typography variant="caption" sx={{ mr: 1 }}>
                        <pre>{tokenOrIntent.id}</pre>
                      </Typography>
                      {order.token && <SaveIcon fontSize="small" />}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {tokenOrIntent.type === "card" && (
                      <>
                        {tokenOrIntent.card.brand.toUpperCase()} ending in{" "}
                        {tokenOrIntent.card.last4}
                      </>
                    )}
                  </TableCell>
                  <TableCell align="right">${order.total}</TableCell>
                  <TableCell>
                    {order.charged && (
                      <Button variant="contained" disabled>
                        Charged
                      </Button>
                    )}
                    {!order.charged && (
                      <Button
                        variant="contained"
                        onClick={() => charge(order)}
                        loading={busy}
                      >
                        Charge Order
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
