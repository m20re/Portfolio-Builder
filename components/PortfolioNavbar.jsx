"use client";

import { useState } from "react";
import Link from "next/link";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import { useNavItems } from "./NavItemsContext";

function slugify(label) {
  return label.toLowerCase().replace(/\s+/g, "-");
}

export default function PortfolioNavbar() {
  const { navItems, addItem } = useNavItems();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: "center" }}>
          {navItems.map((item) => (
            <Link
              key={item.slug}
              href={`/builder/${item.slug}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Typography
                variant="h6"
                component="span"
                sx={{ mx: 2, cursor: "pointer" }}
              >
                {item.label}
              </Typography>
            </Link>
          ))}

          <IconButton
            size="large"
            color="inherit"
            sx={{ mx: 2 }}
            onClick={addItem}
          >
            <AddIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
}