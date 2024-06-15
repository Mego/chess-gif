import { renderPGNToGif } from "./gif";

renderPGNToGif(
  `[Event "Let\\'s Play!"]
[Site "Chess.com"]
[Date "2024.06.02"]
[Round "?"]
[White "cso_b"]
[Black "TheOnlyMego"]
[Result "0-1"]
[ECO "A03"]
[WhiteElo "1089"]
[BlackElo "389"]
[TimeControl "1/259200"]
[EndDate "2024.06.06"]
[Termination "TheOnlyMego won by checkmate"]

1. f4 d5 2. e4 dxe4 3. d3 Nf6 4. dxe4 Qxd1+ 5. Kxd1 Nxe4 6. Ke1 g6 7. Bc4 Nd6 8.
Bb3 Bg7 9. Nf3 b6 10. Kf2 Bb7 11. Nbd2 Nd7 12. Re1 O-O 13. c3 Rfe8 14. Nf1 c5
15. Kg1 Rad8 16. N3d2 b5 17. Ng3 a5 18. a4 c4 19. Bc2 b4 20. cxb4 axb4 21. Be4
Nxe4 22. Ndxe4 f5 23. Ng5 Nc5 24. Ne6 Nxe6 25. Rxe6 Rd1+ 26. Kf2 Bd4+ 27. Ke2
Rg1 28. Kd2 c3+ 29. Kd3 Rd8 30. Kc4 Rxg2 31. Be3 cxb2 32. Rb1 Bd5+ 33. Kxd4
Bxe6+ 34. Ke5 Ba2 35. Re1 Rb8 36. Bc5 Rc2 37. Bxe7 Rc1 38. Bxb4 b1=Q 39. Nxf5
Qb2+ 40. Nd4 Qxb4 41. Rxc1 Re8+ 42. Ne6 Qb2+ 43. Kd6 Qxc1 44. Nc7 Qxf4+ 45. Kd7
Qf7+ 46. Kc6 Rc8 47. Kb5 Qxc7 48. a5 Qc4+ 49. Kb6 Qc5+ 50. Ka6 Bc4+ 51. Kb7 Qc7#
0-1`
);
