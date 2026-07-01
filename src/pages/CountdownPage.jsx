import { useState, useEffect } from "react";
import { Box, Typography, Container, Chip } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SchoolIcon from "@mui/icons-material/School";

function getTimeLeft(target) {
  const diff = target - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function DigitCard({ value, label }) {
  const display = String(value).padStart(2, "0");
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: { xs: 0.5, sm: 1 } }}>
      <Box
        sx={{
          width: { xs: "18vw", sm: 90, md: 108 },
          height: { xs: "20vw", sm: 100, md: 120 },
          maxWidth: { xs: 76, sm: 90, md: 108 },
          maxHeight: { xs: 84, sm: 100, md: 120 },
          borderRadius: { xs: 2, sm: 3 },
          background: "linear-gradient(160deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.07) 100%)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.25)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          "&::after": {
            content: '""',
            position: "absolute",
            top: "50%",
            left: "8%",
            right: "8%",
            height: "1px",
            background: "rgba(0,0,0,0.2)",
          },
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: "7vw", sm: "3rem", md: "3.4rem" },
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1,
            letterSpacing: { xs: "-1px", sm: "-2px" },
            fontVariantNumeric: "tabular-nums",
            fontFamily: '"Inter", monospace',
            textShadow: "0 2px 16px rgba(0,0,0,0.5)",
          }}
        >
          {display}
        </Typography>
      </Box>
      <Typography
        sx={{
          fontSize: { xs: "0.6rem", sm: "0.7rem" },
          fontWeight: 700,
          color: "rgba(255,255,255,0.6)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export default function CountdownPage({ targetDate, title, description, dateText }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <Box
      sx={{
        minHeight: "100dvh",          // dynamic viewport height — handles mobile browser chrome
        background: "linear-gradient(145deg, #0d0b2e 0%, #1a237e 45%, #1565c0 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 5 },
      }}
    >
      {/* Glowing background orbs */}
      <Box sx={{ position: "absolute", top: "-15%", right: "-10%", width: { xs: 220, sm: 380 }, height: { xs: 220, sm: 380 }, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)", pointerEvents: "none" }} />
      <Box sx={{ position: "absolute", bottom: "-20%", left: "-10%", width: { xs: 260, sm: 450 }, height: { xs: 260, sm: 450 }, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>

        {/* Trophy badge */}
        <Box sx={{ textAlign: "center", mb: { xs: 2, sm: 3 } }}>
          <Chip
            icon={<EmojiEventsIcon sx={{ color: "#FFD700 !important", fontSize: { xs: 16, sm: 18 } }} />}
            label="NMEA TENDER SCHOLAR 26"
            sx={{
              bgcolor: "rgba(255,215,0,0.15)",
              border: "1px solid rgba(255,215,0,0.5)",
              color: "#FFD700",
              fontWeight: 700,
              fontSize: { xs: "0.7rem", sm: "0.8rem" },
              letterSpacing: "0.06em",
              height: { xs: 30, sm: 34 },
              px: 0.5,
            }}
          />
        </Box>

        {/* Heading */}
        <Box sx={{ textAlign: "center", mb: { xs: 2, sm: 3 } }}>
          <Typography
            component="h1"
            sx={{
              fontWeight: 800,
              color: "#fff",
              fontSize: { xs: "1.5rem", sm: "2.2rem", md: "2.8rem" },
              lineHeight: 1.2,
              textShadow: "0 2px 24px rgba(0,0,0,0.4)",
              px: 1,
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.65)",
              mt: 1,
              fontSize: { xs: "0.82rem", sm: "0.95rem" },
              lineHeight: 1.6,
              maxWidth: 360,
              mx: "auto",
            }}
          >
            {description}
          </Typography>
        </Box>

        {/* Opening date pill */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: { xs: 3, sm: 4 } }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: { xs: 2, sm: 2.5 },
              py: { xs: 0.8, sm: 1.1 },
              borderRadius: 10,
              background: "rgba(105,240,174,0.12)",
              border: "1px solid rgba(105,240,174,0.35)",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <CalendarMonthIcon sx={{ color: "#69f0ae", fontSize: { xs: 16, sm: 20 } }} />
            <Typography sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 500, fontSize: { xs: "0.78rem", sm: "0.88rem" } }}>
              Available on
            </Typography>
            <Typography sx={{ color: "#69f0ae", fontWeight: 800, fontSize: { xs: "0.82rem", sm: "0.92rem" }, letterSpacing: "0.02em" }}>
              {dateText}
            </Typography>
          </Box>
        </Box>

        {/* Countdown timer */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            gap: { xs: "1.5vw", sm: 2 },
            mb: { xs: 3, sm: 5 },
            flexWrap: "nowrap",
          }}
        >
          <DigitCard value={timeLeft.days} label="Days" />

          {/* Colon */}
          <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: { xs: "6vw", sm: "2.8rem" }, fontWeight: 300, lineHeight: 1, mt: { xs: "3vw", sm: "20px" } }}>:</Typography>

          <DigitCard value={timeLeft.hours} label="Hours" />

          <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: { xs: "6vw", sm: "2.8rem" }, fontWeight: 300, lineHeight: 1, mt: { xs: "3vw", sm: "20px" } }}>:</Typography>

          <DigitCard value={timeLeft.minutes} label="Mins" />

          <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: { xs: "6vw", sm: "2.8rem" }, fontWeight: 300, lineHeight: 1, mt: { xs: "3vw", sm: "20px" } }}>:</Typography>

          <DigitCard value={timeLeft.seconds} label="Secs" />
        </Box>

        {/* School footer */}
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0.8 }}>
          <SchoolIcon sx={{ color: "rgba(255,255,255,0.35)", fontSize: { xs: 15, sm: 18 } }} />
          <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: { xs: "0.72rem", sm: "0.8rem" }, textAlign: "center" }}>
            PPMHSS Kottukkara, Kondotty, Malappuram
          </Typography>
        </Box>

      </Container>
    </Box>
  );
}
