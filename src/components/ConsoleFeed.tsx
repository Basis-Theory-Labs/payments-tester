"use client";
import React, { useEffect, useRef, useState } from "react";
import { Console, Hook as hook, Unhook as unhook } from "console-feed";
import type { Message } from "console-feed/lib/definitions/Console";
import { Box } from "@mui/system";
import { createTheme } from "@mui/material/styles";
import { IconButton } from "@mui/material";
import NotInterestedIcon from "@mui/icons-material/NotInterested";

const darkTheme = createTheme({
  palette: {
    mode: "dark", // Dark mode only for this component
  },
});

const ConsoleFeed = () => {
  const [logs, setLogs] = useState<Message[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  // run once!
  useEffect(() => {
    const hookedConsole = hook(
      window.console,
      (log) => {
        setLogs((curr) => [...curr, log]);
        if (ref.current) ref.current.scrollTop = ref.current?.scrollHeight;
      },
      false,
    );

    return () => {
      unhook(hookedConsole);
    };
  }, []);

  return (
    <Box
      height="100%"
      bgcolor={darkTheme.palette.background.default}
      color={darkTheme.palette.text.secondary}
      display="flex"
      flexDirection="column"
    >
      <Box display="flex" flexDirection="row-reverse">
        <IconButton
          color="inherit"
          size="small"
          title="Clear"
          onClick={() => setLogs([])}
        >
          <NotInterestedIcon fontSize="inherit" />
        </IconButton>
      </Box>
      <Box flexGrow={1} maxHeight="500px" overflow="auto" ref={ref}>
        <Console
          filter={["info", "debug", "error"]}
          logs={logs as never}
          variant="dark"
        />
      </Box>
    </Box>
  );
};

export { ConsoleFeed };
