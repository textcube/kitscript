/*!
 * PixelArt sprite pack  v1.0  -  Sopranian / Undeath pixel sprites for rogue + sopraknight
 * 의존성 없음. <script src="pixelart/sprites.js"></script> 로 불러오거나 그대로 인라인 붙여넣기 가능.
 * window.PixelArt 를 노출한다.  사용법은 pixelart/README.md 참고.
 */
(function (root) {
  "use strict";

  var DATA = {
    version: "1.0.0",
    palette: {
      k: "#0f0c1d",
      n: "#1b1731",
      d: "#2c2751",
      m: "#453f79",
      l: "#7973ad",
      s: "#ffdfc0",
      t: "#f3b892",
      u: "#cf8779",
      r: "#ff8d8d",
      G: "#fff2ac",
      g: "#f7c95d",
      o: "#c78a2d",
      O: "#7c4a2a",
      a: "#ffbb6e",
      b: "#dd7a3c",
      B: "#9c4a30",
      e: "#cfe27d",
      f: "#8db653",
      h: "#517a47",
      j: "#2f4a3a",
      w: "#fff8e8",
      i: "#ecdfc0",
      y: "#bba78c",
      c: "#e6f3ff",
      C: "#a7d1ff",
      A: "#6289d8",
      p: "#c7a8ff",
      P: "#8459d1",
      q: "#51308f",
      R: "#ea5b75",
      x: "#8f2848",
      T: "#82ecd2"
    },
    ramps: {
      indigo: ["k", "n", "d", "m", "l"],
      skin: ["s", "t", "u", "r"],
      gold: ["G", "g", "o", "O"],
      orange: ["a", "b", "B"],
      green: ["e", "f", "h", "j"],
      bone: ["w", "i", "y"],
      ice: ["c", "C", "A"],
      violet: ["p", "P", "q"],
      red: ["R", "x"],
      hope: ["T"]
    },
    outline: {
      k: "k",
      n: "k",
      d: "k",
      m: "k",
      l: "d",
      s: "B",
      t: "B",
      u: "B",
      r: "B",
      G: "O",
      g: "O",
      o: "O",
      O: "k",
      a: "O",
      b: "O",
      B: "k",
      e: "j",
      f: "j",
      h: "j",
      j: "k",
      w: "O",
      i: "O",
      y: "O",
      c: "d",
      C: "d",
      A: "d",
      p: "k",
      P: "k",
      q: "k",
      R: "x",
      x: "k",
      T: "h"
    },
    moods: ["waiting", "angry", "leaving", "satisfied"],
    sprites: {
      soprano: {
        kind: "musician",
        w: 32,
        h: 32,
        ax: 16,
        ay: 31,
        pieces: {
          head: {
            x: 8,
            y: 1,
            r: [
              "....dddddddd....",
              "...ddmnnnndnn...",
              "..dnnmmnkdlnnn..",
              ".dnnmdnnknnddnk.",
              "dnndnnnnknnnnnnk",
              "dnmdknnnknnnknnk",
              "dndnnkssssnknnnk",
              "dnnnnsssssssnnnk",
              "dnnnsssssssssnnk",
              "dnssssssssssstkk",
              ".nssssssssssstk.",
              ".dssssssssssttk.",
              "..kssssssssttk..",
              "...ktsssstttk...",
              ".....kttttk....."
            ]
          },
          face_smile: {
            x: 11,
            y: 10,
            r: [".kk....kk.", ".wk....wk.", ".kn....kn.", "rr......rr", "....uu...."]
          },
          face_sing: {
            x: 11,
            y: 10,
            r: [".kk....kk.", ".wk....wk.", ".kn....kn.", "rr......rr", "....kk....", "....Rk...."]
          },
          face_play: {
            x: 11,
            y: 11,
            r: ["..kk...kk.", ".k.......k", "rr......rr", "....uu...."]
          },
          face_hit: {
            x: 12,
            y: 10,
            r: ["k.......k", ".kk...kk.", "k.......k", ".........", "...kk....", "...kk...."]
          },
          face_cheer: {
            x: 11,
            y: 10,
            r: ["..kk...kk.", ".k.......k", "..........", "rr.kkkk.rr", "...kRRk...", "....kk...."]
          },
          ear: {
            x: 9,
            y: 14,
            r: [
              "g............g",
              "o............o"
            ]
          },
          hairb: {
            x: 5,
            y: 12,
            r: [
              "..dnnk..........knnd..",
              ".dmnnk..........knnmd.",
              ".dndnnk........knndnd.",
              ".dnnnnk........knnnnd.",
              "dnnnnnk........knnnnnd",
              "dmnnnk..........knnnmd",
              "dndnnk..........knndnd",
              "dnnnnk..........knnnnd",
              ".dnnnk..........knnnd.",
              ".dmnnk..........knnmd.",
              ".dndk............kdnd.",
              ".dnnk............knnd.",
              "..dnnk..........knnd..",
              "..dmnk..........knmd..",
              "..dnk............knd..",
              "...dk............kd..."
            ]
          },
          skirt: {
            x: 7,
            y: 21,
            r: [
              ".....mmdddnn......",
              ".....mmdddnn......",
              "....mmddddnnn.....",
              "...mmdddndddnn....",
              "...mmdddndddnn....",
              "..mmddddndddnnn...",
              ".mmdddddndddgnnn..",
              ".mddddddndddddnnn.",
              "gogogogogogogogog."
            ]
          },
          torso: {
            x: 12,
            y: 16,
            r: ["...tt...", ".sssssst", "mdsssssd", ".mdsggsn", ".mddgddn", "..mddddn", "..oooooo"]
          },
          armL0: {
            x: 0,
            y: 18,
            r: [
              "............ll.",
              "........llllmmd",
              "....llllmmmmmdd",
              "...lmmmmmmmddd.",
              ".sssmmmmdddd...",
              "ssssmmddd......",
              ".sssddd........",
              "..s............"
            ],
            ol: "n"
          },
          armL1: {
            x: 0,
            y: 13,
            r: [
              ".sss...........",
              "sssslll........",
              "ssssmmmll......",
              ".sssmmmmml.....",
              "...lmmmmmmll...",
              "....ddmmmmmmll.",
              ".......dmmmmmmd",
              ".........ddmmdd",
              "............dd."
            ],
            ol: "n"
          },
          armLm: {
            x: 0,
            y: 17,
            r: [
              ".ss.llll.......",
              "ssssmmmmllllll.",
              "ssssmmmmmmmmmmd",
              ".sssmmmmmmmmmdd",
              "....dddddddddd."
            ],
            ol: "n"
          },
          armLv: {
            x: 2,
            y: 9,
            r: [
              ".ss..........",
              "ssss.........",
              "ssssll.......",
              ".sssmml......",
              "..lmmmml.....",
              "..lmmmmmd....",
              "...lmmmmm....",
              "....lmmmml...",
              ".....dmmmml..",
              ".......lmmml.",
              "........lmmmd",
              ".........lmdd",
              "..........dd."
            ],
            ol: "n"
          },
          armR0: {
            x: 18,
            y: 18,
            r: [
              ".ll..........",
              "lmmll........",
              "lmmmmlll.....",
              ".dmmmmmmll...",
              "...lmmmmmmd..",
              "....dmmmmmsss",
              "......lmmdsss",
              ".......dddsss",
              "..........sss"
            ],
            ol: "n"
          },
          armR1: {
            x: 18,
            y: 13,
            r: [
              "...........sss",
              "........lllsss",
              "......llmmmsss",
              ".....lmmmmmsss",
              "...llmmmmmdd..",
              ".llmmmmdddd...",
              "lmmmmddd......",
              "lmdddd........",
              ".dd..........."
            ],
            ol: "n"
          },
          armRv: {
            x: 18,
            y: 9,
            r: [
              "..........ss.",
              ".........ssss",
              ".......llssss",
              "......lmmsss.",
              ".....lmmmmd..",
              "....lmmmmdd..",
              "....lmmmdd...",
              "...lmmmdd....",
              "..lmmddd.....",
              ".lmmdd.......",
              "lmmdd........",
              "lmdd.........",
              ".dd.........."
            ],
            ol: "n"
          },
          shoeA: {
            x: 10,
            y: 30,
            r: ["nn"]
          },
          shoeB: {
            x: 20,
            y: 30,
            r: ["nn"]
          },
          b_back: {
            x: 4,
            y: 20,
            r: [
              "......knnnnnnn............................nnnnnnnk......",
              "......knnnnnnn............................nnnnnnnk......",
              "......knnnnnnn............................nnnnnnnk......",
              ".....knnnnnnnn............................nnnnnnnnk.....",
              "....kknnnnnnnn............................nnnnnnnnkk....",
              "....kkmnnnnnnn............................nnnnnnnnkk....",
              "...kknnnnnnnnn............................nnnnnnnnnkk...",
              "...kknnnnnnnnn............................nnnnnnnnnkk...",
              "..kkknnnnnnnnn............................nnnnnnnnnkkk..",
              ".kkknnnnnnnnnn............................nnnnnnnnnnkkk.",
              ".kkknnnnnnnnnn............................nnnnnnnnnnkkk.",
              ".kkknnnnnnnnnn............................nnnnnnnnnnkkk.",
              ".kkknnnnnnnnnn............................nnnnnnnnnnkkk.",
              ".kkknnnnnnnnnn............................nnnnnnnnnnkkk.",
              ".kkknnnnnnnnnn............................nnnnnnnnnnkkk.",
              "..kkknnnnnnnnn............................nnnnnnnnnkkk..",
              "..kkknnnnnnnnn............................nnnnnnnnnkkk..",
              "...kknnnnnnnnn............................nnnnnnnnnkk...",
              "...kkknnnnnnnn............................nnnnnnnnkkk...",
              "....kknnnnnnnn............................nnnnnnnnkk....",
              "....kkmnnnnnnn............................nnnnnnnnkk....",
              ".....kknnnnnnn............................nnnnnnnkk.....",
              ".....kknnnnnnn............................nnnnnnnkk.....",
              ".....kknnnnnnn............................nnnnnnnkk.....",
              ".....kknnnnnnn............................nnnnnnnkk.....",
              ".....kkmnnnnnn............................nnnnnnnkk.....",
              ".....kknnnnnnn............................nnnnnnnkk.....",
              "....kkknnnnnnn............................nnnnnnnkkk....",
              "....kknnnnnnnn............................nnnnnnnnkk....",
              "...kkknnnnnnnn............................nnnnnnnnkkk...",
              "...kkknnnnnnnn............................nnnnnnnnkkk...",
              "..kkknnnnnnnnn............................nnnnnnnnnkkk..",
              ".kkkknnnnnnnnn............................nnnnnnnnnkkkk.",
              ".kkkknnnnnnnnn............................nnnnnnnnnkkkk.",
              "kkkknnnnnnnnnn............................nnnnnnnnnnkkkk",
              "kkkknnnnnnnnnn............................nnnnnnnnnnkkkk",
              "kkkknnnnnnnnnn............................nnnnnnnnnnkkkk",
              "kkkknnnnnnnnnn............................nnnnnnnnnnkkkk",
              "kkkknnnnnnnnnn............................nnnnnnnnnnkkkk",
              "kkkknnnnnnnnnn............................nnnnnnnnnnkkkk",
              "kkkkknnnnnnnnn............................nnnnnnnnnkkkkk"
            ]
          },
          b_torso: {
            x: 2,
            y: 42,
            r: [
              "...........................ssssss...........................",
              "........................ssssssssssss........................",
              ".......................ssuuuuuuuuuuss.......................",
              "......................sssuuuuuuuuuusst......................",
              ".....................ssssuuuuuuuuuussst.....................",
              ".....................ssssssssssttttssst.....................",
              "....................sssssssssssttttssstt....................",
              "...................msssssssssssttttsssttm...................",
              ".................mmmGssssssssssttttsstttdGm.................",
              "................mmddgssssssssssttttsstttgddd................",
              "..............mmmdddGssssssssssttttstttdGddddm..............",
              "............mmmdddddgssssssssssssssttttdGddddddm............",
              "..........mmmddddddddgssssssssssssttttdgdddddddddm..........",
              "........mmmdddddddddddGttssssssttttttdGddddddddddddm........",
              ".......mmdddddddddddddgGttttttGtttttdGgdddddddddddddd.......",
              ".....mmmddddddddddddddddgGdttGgGtddGgdddddddddddddddddm.....",
              "....mmddddddgdddddddddddddgGGgoGgGgdddddddddddddddddddnn....",
              "...mmddddddddddddddddddddddddgggdddddddddddddddddddddddnn...",
              "..mmddddddddddddddddddddddddddgdddddddddddddddddgdddddddnn..",
              "..mnnnnnnnnnnnnnnnnngnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn..",
              ".mmnnnngnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnngnnnnnnnnnnnnnnnn.",
              "omonononononononononononononononononononononononononogononon"
            ],
            ol: "n"
          },
          b_head: {
            x: 12,
            y: 4,
            r: [
              ".................dddddd.................",
              ".............dddddddddddddd.............",
              "..........dddddddddnnnnnnddddd..........",
              ".........ddddddnnnnlnnnnnnnnndd.........",
              ".......dddddnnnnnmmmnnnnnnnnnnnnd.......",
              "......dddddnnnnnnnnnnnnnnnnnnnnnnd......",
              ".....ddddnnnnnnnnnnnnnnnnnnnnnnnnnk.....",
              "....ddddnnnnnnnmnnnnknndddnnnnnnnnnk....",
              "...ddddnnnnnnmmnnnnnknnnndddnnnnndnkk...",
              "...dddnnnnnmmdnnnnnkknknnnndddnnnnnkk...",
              "..dddnnnnnmddnnnnnnkknknnnnnndddnnnnkk..",
              ".dddnnnnnddnnnnnnnknknnknnnnnnnnnnnnkkk.",
              ".ddnnnnnddnnnnnnnnknknnknnnnnnnnnnnnnkk.",
              ".ddnnnnnddknnnnnnknnknnnknnnnnknnnnnnkk.",
              "dddnnnnddnnknnnnnknnknnnknnnnknnnnnnnkkk",
              "dddnnnnddnnnknnnnknnknnnknnnnknnnnnnnkkk",
              "ddnnnnddnnnnnknnknssssnnnknnknnnnnnnnkkk",
              "ddnnnddnnnnnnnnskssssssssknnnnnnnnnnnkkk",
              "ddnnnnnnnnnnnnsssssssssssssnnnnnnnnnnkkk",
              "ddnnnnnnnnnnnssssssssssssssssnnnnnnnnnkk",
              "ddnnnnnnnnnsssssssssssssssssssnnnnnnnnkk",
              "ddnnnnnnnnsssssssssssssssssssssnnnnnnnkk",
              "ddnnnnnnnsssssssssssssssssssssssnnnnnnkk",
              "ddnnnnnnsssssssssssssssssssssssssnnnnkkk",
              "ddnnssssssssssssssssssssssssssssssntkkkk",
              "ddnnssssssssssssssssssssssssssssstttkkkk",
              ".dnnssssssssssssssssssssssssssssstttkkk.",
              ".dnnssssssssssssssssssssssssssssstttkkk.",
              "..dnssssssssssssssssssssssssssssstttkk..",
              "..dnssssssssssssssssssssssssssssttttkk..",
              "...dnssssssssssssssssssssssssssstttkk...",
              "....nssssssssssssssssssssssssssttttk....",
              "....dssssssssssssssssssssssssstttttk....",
              ".....dssssssssssssssssssssssstttttk.....",
              ".......sssssssssssssssssssssttttt.......",
              "........tssssssssssssssssstttttt........",
              ".........ttsssssssssssssttttttt.........",
              "..........ttttsssssssttttttttt..........",
              "............tttttttttttttttt............",
              "...............tttttttttt..............."
            ],
            ol: "k"
          },
          b_front: {
            x: 0,
            y: 43,
            r: [
              "....ss............",
              ".ss...............",
              ".st...............",
              "...ssssss.........",
              "..ssssssst........",
              ".sssssssstt.......",
              ".sssssssstt.......",
              ".sssssssttt.......",
              ".sssssstttt.......",
              ".ltttttttt........",
              ".llttttttlmm......",
              ".llllllllllmmm....",
              ".llllllllllmmmm...",
              "lllllllllllmmmm...",
              "llllllllllllmmm...",
              ".mmmmmmmmmmmmmmm..",
              ".mmmmmmmmmmmmmmm..",
              "mmgmmmgmmmgmmmgmm.",
              "gmmmgmmmgmmmgmmmg.",
              "mmmmmmmmmmmmmmmmm.",
              "mmmmmmmmmmmmmmmmmm"
            ]
          },
          b_face_smile: {
            x: 14,
            y: 31,
            r: [
              "........kkkk............kkkk........",
              ".......kwwkkk..........kwwkkk.......",
              ".......kwwkkk..........kwwkkk.......",
              ".......kkkkkk..........kkkkkk.......",
              ".......kOOOOk..........kOOOOk.......",
              "......rrrrBOk..........kOBBOrrrr....",
              ".....rrrrrrk............kkkrrrrrr...",
              "......rrrr..................rrrr....",
              "..................tt................",
              "..............O......O..............",
              "...............O....O...............",
              "................OOOO................",
              "....................................",
              "gG................................gG",
              "og................................og",
              "o.................................o."
            ]
          },
          b_face_blink: {
            x: 14,
            y: 33,
            r: [
              ".......kkkkkk..........kkkkkk.......",
              "........kkkk............kkkk........",
              "....................................",
              "......rrrr..................rrrr....",
              ".....rrrrrr................rrrrrr...",
              "......rrrr..................rrrr....",
              "..................tt................",
              "..............O......O..............",
              "...............O....O...............",
              "................OOOO................",
              "....................................",
              "gG................................gG",
              "og................................og",
              "o.................................o."
            ]
          },
          b_face_sing: {
            x: 14,
            y: 31,
            r: [
              "........kkkk............kkkk........",
              ".......kwwkkk..........kwwkkk.......",
              ".......kwwkkk..........kwwkkk.......",
              ".......kkkkkk..........kkkkkk.......",
              ".......kOOOOk..........kOOOOk.......",
              "......rrrrBOk..........kOBBOrrrr....",
              ".....rrrrrrk............kkkrrrrrr...",
              "......rrrr..................rrrr....",
              "..................tt................",
              "...............kkkkkk...............",
              "...............kwwwwk...............",
              "...............kRRRRk...............",
              "................kRRk................",
              "gG...............kk...............gG",
              "og................................og",
              "o.................................o."
            ]
          },
          b_face_hit: {
            x: 14,
            y: 31,
            r: [
              ".......k....k..........k....k.......",
              "........k..k............k..k........",
              ".........kk..............kk.........",
              ".........kk..............kk.........",
              "........k..k............k..k........",
              "......rrrr..k..........k....rrrr....",
              ".....rrrrrr................rrrrrr...",
              "......rrrr..................rrrr....",
              "..................tt................",
              "................kkkk................",
              "...............k....k...............",
              "................kkkk................",
              "....................................",
              "gG................................gG",
              "og................................og",
              "o.................................o."
            ]
          },
          b_face_cheer: {
            x: 14,
            y: 34,
            r: [
              "........kkkk............kkkk........",
              ".......kk..kk..........kk..kk.......",
              "......rrrr..k..........k....rrrr....",
              ".....rrrrrr................rrrrrr...",
              "......rrrr..................rrrr....",
              "..................tt................",
              "...............kkkkkk...............",
              "...............kwwwwk...............",
              "...............kRRRRk...............",
              "................kRRk................",
              "gG...............kk...............gG",
              "og................................og",
              "o.................................o."
            ]
          }
        },
        anims: {
          idle: {
            loop: true,
            frames: [
              {
                d: 360,
                l: "hairb:0,0 skirt torso:0,0 armL1:0,0 armR0:0,0 head:0,0 face_smile:0,0 ear:0,0 "
              },
              {
                d: 240,
                l: "hairb:1,0 skirt torso:0,0 armL1:0,0 armR0:0,0 head:0,0 face_smile:0,0 ear:0,0 "
              },
              {
                d: 360,
                l: "hairb:0,0 skirt torso:0,1 armL1:0,1 armR0:0,1 head:0,1 face_smile:0,1 ear:0,1 "
              },
              {
                d: 240,
                l: "hairb:-1,0 skirt torso:0,1 armL1:0,1 armR0:0,1 head:0,1 face_smile:0,1 ear:0,1 "
              }
            ]
          },
          stand: { alias: "idle" },
          perform: {
            loop: true,
            frames: [
              {
                d: 110,
                l: "hairb:0,0 skirt torso:0,0 armLm:0,0 armR0:0,0 head:0,0 face_sing:0,0 ear:0,0 +fx/note_a_g:25,11 +fx/note_b_w:0,9"
              },
              {
                d: 110,
                l: "hairb:0,0 skirt torso:0,-1 armL1:0,-1 armR0:0,-1 head:0,-1 face_sing:0,-1 ear:0,-1 +fx/note_a_g:25,8 +fx/note_b_w:0,6 +fx/wave_s:26,14"
              },
              {
                d: 110,
                l: "hairb:0,0 skirt torso:0,0 armL1:0,0 armR0:0,0 head:0,0 face_smile:0,0 ear:0,0 +fx/note_c_g:25,5 +fx/note_b_w:0,3"
              },
              {
                d: 110,
                l: "hairb:0,0 skirt torso:0,-1 armLm:0,-1 armR0:0,-1 head:0,-1 face_sing:0,-1 ear:0,-1 +fx/note_c_w:25,2 +fx/note_a_g:0,11"
              },
              {
                d: 110,
                l: "hairb:0,0 skirt torso:0,0 armL0:0,0 armR0:0,0 head:0,0 face_sing:0,0 ear:0,0 +fx/note_b_g:0,8 +fx/note_a_w:25,12 +fx/wave_m:26,13"
              },
              {
                d: 110,
                l: "hairb:0,0 skirt torso:0,0 armLm:0,0 armR0:0,0 head:0,0 face_smile:0,0 ear:0,0 +fx/note_a_g:0,5 +fx/note_c_g:25,9"
              }
            ]
          },
          walk: {
            loop: true,
            frames: [
              {
                d: 130,
                l: "hairb:-1,0 skirt shoeA torso:0,0 armL0:0,0 armR0:0,0 head:0,0 face_smile:0,0 ear:0,0 "
              },
              {
                d: 130,
                l: "hairb:0,0 skirt torso:0,-1 armL0:0,-1 armR0:0,-1 head:0,-1 face_smile:0,-1 ear:0,-1 "
              },
              {
                d: 130,
                l: "hairb:1,0 skirt shoeB torso:0,0 armL0:0,0 armR0:0,0 head:0,0 face_smile:0,0 ear:0,0 "
              },
              {
                d: 130,
                l: "hairb:0,0 skirt torso:0,-1 armL0:0,-1 armR0:0,-1 head:0,-1 face_smile:0,-1 ear:0,-1 "
              }
            ]
          },
          hit: {
            loop: false,
            frames: [
              {
                d: 90,
                l: "hairb:2,0 skirt torso:-1,1 armL1:-1,1 armR1:-1,1 head:-1,1 face_hit:-1,1 ear:-1,1 "
              },
              {
                d: 160,
                l: "hairb:1,0 skirt torso:-1,0 armL0:-1,0 armR0:-1,0 head:-1,0 face_hit:-1,0 ear:-1,0 "
              }
            ]
          },
          cheer: {
            loop: true,
            frames: [
              {
                d: 120,
                l: "hairb:0,0 skirt torso:0,0 armLv:0,0 armRv:0,0 head:0,0 face_cheer:0,0 ear:0,0 +fx/twk_s_g:3,8 +fx/twk_s_g:27,6"
              },
              {
                d: 110,
                l: "hairb:1,0 skirt torso:0,-2 armLv:0,-2 armRv:0,-2 head:0,-2 face_cheer:0,-2 ear:0,-2 +fx/twk_m_g:2,6 +fx/twk_s_g:28,9"
              },
              {
                d: 120,
                l: "hairb:0,0 skirt torso:0,-3 armLv:0,-3 armRv:0,-3 head:0,-3 face_cheer:0,-3 ear:0,-3 +fx/twk_s_g:3,4 +fx/twk_m_g:26,5"
              },
              {
                d: 110,
                l: "hairb:-1,0 skirt torso:0,-1 armLv:0,-1 armRv:0,-1 head:0,-1 face_cheer:0,-1 ear:0,-1 +fx/twk_m_g:2,7 +fx/twk_s_g:27,7"
              }
            ]
          },
          bust: {
            loop: true,
            frames: [
              { d: 2200, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_smile:0,0 b_front:0,0" },
              { d: 110, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_blink:0,0 b_front:0,0" },
              { d: 1600, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_smile:0,1 b_front:0,1" },
              { d: 110, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_blink:0,1 b_front:0,1" }
            ],
            w: 64,
            h: 64,
            ax: 32,
            ay: 63
          },
          bust_sing: {
            loop: true,
            frames: [
              { d: 400, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_sing:0,0 b_front:0,0" },
              { d: 400, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_sing:0,1 b_front:0,1" }
            ],
            w: 64,
            h: 64,
            ax: 32,
            ay: 63
          },
          bust_hit: {
            loop: true,
            frames: [
              { d: 400, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_hit:0,0 b_front:0,0" },
              { d: 400, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_hit:0,1 b_front:0,1" }
            ],
            w: 64,
            h: 64,
            ax: 32,
            ay: 63
          },
          bust_cheer: {
            loop: true,
            frames: [
              { d: 400, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_cheer:0,0 b_front:0,0" },
              { d: 400, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_cheer:0,1 b_front:0,1" }
            ],
            w: 64,
            h: 64,
            ax: 32,
            ay: 63
          }
        },
        label: "소프라노"
      },
      pianist: {
        kind: "musician",
        w: 32,
        h: 32,
        ax: 16,
        ay: 31,
        pieces: {
          bun: {
            x: 7,
            y: 1,
            r: [".dddd.", "ddnnnk", "dnmnnk", "dnnnnk", "dnnnkk", ".kkkk."]
          },
          pin: {
            x: 8,
            y: 4,
            r: [".G", "gg", "g."]
          },
          head: {
            x: 8,
            y: 2,
            r: [
              "....dddddddd....",
              "...dnnnnnndnn...",
              "..dnnndndlnndn..",
              ".dnnmdnknnddnnk.",
              "dnndnnknnnnknnkk",
              "dnmdnnknnnknnnnk",
              "dndnnknnsskssnkk",
              "dnnnnkssssssstkk",
              "dnnnnsssssssstkk",
              "dnssssssssssstkk",
              ".nssssssssssstk.",
              ".dssssssssssttk.",
              "..kssssssssttk..",
              "...ktsssstttk...",
              ".....kttttk....."
            ]
          },
          face_smile: {
            x: 11,
            y: 11,
            r: [".kk....kk.", ".wk....wk.", ".kn....kn.", "rr......rr", "....uu...."]
          },
          face_sing: {
            x: 11,
            y: 11,
            r: [".kk....kk.", ".wk....wk.", ".kn....kn.", "rr......rr", "....kk....", "....Rk...."]
          },
          face_play: {
            x: 11,
            y: 12,
            r: ["..kk...kk.", ".k.......k", "rr......rr", "....uu...."]
          },
          face_hit: {
            x: 12,
            y: 11,
            r: ["k.......k", ".kk...kk.", "k.......k", ".........", "...kk....", "...kk...."]
          },
          face_cheer: {
            x: 11,
            y: 11,
            r: ["..kk...kk.", ".k.......k", "..........", "rr.kkkk.rr", "...kRRk...", "....kk...."]
          },
          ear: {
            x: 23,
            y: 15,
            r: ["g", "o"]
          },
          torso: {
            x: 12,
            y: 17,
            r: ["...tt...", "mddttddn", "mdwsswdn", "mddwwddn", "mdddddnn", "mdddddnn"]
          },
          kbd: {
            x: 6,
            y: 22,
            r: [
              "nnnnnnnnnnnnnnnnnnnn",
              "wkwwkwkwwkwwkwkwwkww",
              "wwiwwiwwiwwiwwiwwiww",
              "nddddddddgGgdddddddd",
              "kkkkkkkkkkkkkkkkkkkk"
            ]
          },
          skirt: {
            x: 9,
            y: 26,
            r: [
              "mddddddddddddn",
              "mdddddddgddddn",
              "gogogogogogogo"
            ]
          },
          stand: {
            x: 9,
            y: 27,
            r: [
              "lm..........ml",
              ".lmmm....mmm..",
              ".....mmmm.....",
              "..mmm....mmm..",
              "mm..........mm"
            ]
          },
          bench: {
            x: 2,
            y: 26,
            r: ["llllllll", "dddgdddn", "n......n"]
          },
          aL_a: {
            x: 9,
            y: 18,
            r: ["...m.", "..mdn", ".sdnn", "mstn.", ".sss.", ".sss."]
          },
          aL_b: {
            x: 8,
            y: 18,
            r: ["....m.", "..mmdn", ".sddnn", "sssnn.", "sss..."]
          },
          aL_c: {
            x: 7,
            y: 18,
            r: [".....m.", "...mmdn", ".mtddnn", ".stnnn.", "sssn...", "sss...."]
          },
          aR_a: {
            x: 18,
            y: 18,
            r: [".mm..", "mddn.", "mddt.", ".mstn", ".sss.", ".sss."]
          },
          aR_b: {
            x: 18,
            y: 18,
            r: [".mm...", "mddm..", "mdddt.", ".ndsss", "...sss"]
          },
          aR_c: {
            x: 18,
            y: 18,
            r: [".mm....", "mddm...", "mdddst.", ".nndst.", "....sss", "....sss"]
          },
          aL_up: {
            x: 6,
            y: 13,
            r: ["sss.....", "sss.....", "sttt....", "..ttt...", "....ttt.", ".....ttt", "......tt"],
            ol: false
          },
          aR_up: {
            x: 18,
            y: 13,
            r: ["......sss", "......sss", ".....tstt", "...stt...", "..stt....", ".ttt.....", "tt......."],
            ol: false
          },
          press_a: {
            x: 11,
            y: 23,
            r: ["ii"]
          },
          press_b: {
            x: 20,
            y: 23,
            r: ["ii"]
          },
          press_c: {
            x: 8,
            y: 23,
            r: ["ii"]
          },
          press_d: {
            x: 23,
            y: 23,
            r: ["ii"]
          },
          skirtS: {
            x: 7,
            y: 21,
            r: [
              ".....mmdddnn......",
              ".....mmdddnn......",
              "....mmddddnnn.....",
              "...mmdddndddnn....",
              "...mmdddndddnn....",
              "..mmddddndddnnn...",
              ".mmdddddndddgnnn..",
              ".mddddddndddddnnn.",
              "gogogogogogogogog."
            ]
          },
          kbdc: {
            x: 19,
            y: 22,
            r: ["nnnnnnnnnn", "wkwkwwkwkw", "wwwwwwwwww", "nddgGdddnn", "kkkkkkkkkk"]
          },
          aW_L: {
            x: 10,
            y: 19,
            r: ["...t", "..st", "..tt", ".tt.", "ss..", "ss.."],
            ol: "O"
          },
          aW_R: {
            x: 18,
            y: 19,
            r: ["st...", "ss...", ".ss..", "..sss", "..sss", "..stt"],
            ol: "O"
          },
          shoeA: {
            x: 10,
            y: 30,
            r: ["nn"]
          },
          shoeB: {
            x: 20,
            y: 30,
            r: ["nn"]
          },
          b_back: {
            x: 11,
            y: 3,
            r: [
              "......dddddd......",
              "....dddnnnnnnd....",
              "...ddnnnnnnnnnk...",
              "..ddnnnnnnnnnnnk..",
              ".ddnnnnnnnnnnnnkk.",
              ".dnnnmmnnnnnnnnkk.",
              "ddnnnmmnnnnnnnnkkk",
              "dnnnnnnnnnnnnnnkkk",
              "dnnnnnnnnnnnnnnkkk",
              "dnnnnnnnnnnnnnkkkk",
              "dnnnnnnnnnnnnnkkkk",
              "dnnnnnnnnnnnnkkkkk",
              ".nnnnnnnnnnnkkkkk.",
              ".dnnnnnnnnnkkkkkk.",
              "..knnnnnnkkkkkkk..",
              "...kkkkkkkkkkkk...",
              "....kkkkkkkkkk....",
              "......kkkkkk......"
            ]
          },
          b_torso: {
            x: 2,
            y: 42,
            r: [
              "...........................ssssss...........................",
              "........................ssssssssssss........................",
              ".......................ssuuuuuuuuuuss.......................",
              "......................sssuuuuuuuuuusst......................",
              ".....................ssssuuuuuuuuuussst.....................",
              ".....................ssssssssssttttssst.....................",
              "....................sssssssssssttttssstt....................",
              "...................msssssssssssttttsssttm...................",
              ".................mmmGssssssssssttttsstttdGm.................",
              "................mmddgssssssssssttttsstttgddd................",
              "..............mmmdddGssssssssssttttstttdGddddm..............",
              "............mmmdddddgssssssssssssssttttdGddddddm............",
              "..........mmmddddddddgssssssssssssttttdgdddddddddm..........",
              "........mmmdddddddddddGttssssssttttttdGddddddddddddm........",
              ".......mmdddddddddddddgGtttttwwtttttdGgdddddddddddddd.......",
              ".....mmmddddddddddddddddgGdwwwwwwddGgdddddddddddddddddm.....",
              "....mmddddddgdddddddddddddgGgwwGgGgdddddddddddddddddddnn....",
              "...mmdddddddddddddddddddddddddgddddddddddddddddddddddddnn...",
              "..mmddddddddddddddddddddddddddddddddddddddddddddgdddddddnn..",
              "..mnnnnnnnnnnnnnnnnngnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn..",
              ".mmnnnngnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnngnnnnnnnnnnnnnnnn.",
              "omonononononononononononononononononononononononononogononon"
            ],
            ol: "n"
          },
          b_head: {
            x: 12,
            y: 4,
            r: [
              ".................dddddd.................",
              ".............dddddddddddddd.............",
              "..........dddddddddnnnnnnddddd..........",
              ".........ddddddnnnnlnnnnnnnnndd.........",
              "....G..dddddnnnnnnnnnnnnnnnnnnnnd.......",
              "...GgGddddnnnnnnnnnnnnnnnndnnnnnnd......",
              "..GggGdddnnnnnnnnnnnnnnnnnnddnnnnnk.....",
              "...ggdddnnnnnnnddnnnnnnnnnnnndddnnnk....",
              "...gddnnnnnnndddnnkndddnnnnnnnnnddnkk...",
              "...ddnnnnnmdddnnnnknnndddddnnnnnnnnkk...",
              "..ddnnnnndddnnnnnknnnnnnnnddddnnnnnnkk..",
              ".ddnnnnnddnnnnnnnknnnnnnnnnnnnnnnnnnkkk.",
              ".ddnnnnnnnnnnnnnknnnnnnnnnnnknnnnnnnkkk.",
              ".ddnnnnnddnnnnnnknnnnnnnnnnknnnnnnnnkkk.",
              "dddnnnnddnnnnnnknnnnnnnnnnknnnnnnnnnnkkk",
              "ddnnnnnddnnnnnnknnnnnnnnnnknnnnnnnnnnnkk",
              "ddnnnnddnnnnnnknnnnnnnnsskssnnnnnnnnnnkk",
              "ddnnnddnnnnnnnknnnnnsssskssssssnnnnnkkkk",
              "ddnnnnnnnnnnnknnnnssssssssssssssnnnnkkkk",
              "ddnnnnnnnnnnnknnnssssssssssssssstnnnkkkk",
              "ddnnnnnnnnnnnnnsssssssssssssssssstnnkkkk",
              "ddnnnnnnnnnnnssssssssssssssssssssttnkkkk",
              "ddnnnnnnnnnnsssssssssssssssssssssttkkkkk",
              "dnnnnnnnnnsssssssssssssssssssssssttkkkkk",
              "ddnnnnnnnsssssssssssssssssssssssssttkkkk",
              "ddnnssssssssssssssssssssssssssssstttkkkk",
              ".dnnssssssssssssssssssssssssssssstttkkk.",
              ".dnnssssssssssssssssssssssssssssstttkkk.",
              "..dnssssssssssssssssssssssssssssstttkk..",
              "..dnssssssssssssssssssssssssssssttttkk..",
              "...dnssssssssssssssssssssssssssstttkk...",
              "....nssssssssssssssssssssssssssttttk....",
              "....dssssssssssssssssssssssssstttttk....",
              ".....dssssssssssssssssssssssstttttk.....",
              ".......sssssssssssssssssssssttttt.......",
              "........tssssssssssssssssstttttt........",
              ".........ttsssssssssssssttttttt.........",
              "..........ttttsssssssttttttttt..........",
              "............tttttttttttttttt............",
              "...............tttttttttt...............",
              "....................................gG..",
              "....................................og..",
              "....................................o..."
            ],
            ol: "k"
          },
          b_front: {
            x: 6,
            y: 57,
            r: [
              "nndknnndknnndknnndknnndknnndknnndknnndknnndknnndknnn...",
              "wwkkwwwkkwwwkkwwwkkwwwkkwwwkkwwwkkwwwkkwwwkkwwwkkwww...",
              "wwkkwwwkkwwwkkwwwkkwwwkkwwwkkwwwkkwwwkkwwwkkwwwkkwww...",
              "wwkkwwwkkwwwkkwwwkkwwwkkwwwkkwwwkkwwwkkwwwkkwwwkkwww...",
              "wwwwiwwwwiwwwwiwwwwiwwwwiwwwwiwwwwiwwwwiwwwwiwwwwiww..i",
              "iiiiiiiiiiiiiiiiiiiiiiiiGgGiiiiiiiiiiiiiiiiiiiiiiiii..i",
              "yyyyyyyyyyyyyyyyyyyyyyyyygyyyyyyyyyyyyyyyyyyyyyyyyyy..i"
            ]
          },
          b_face_smile: {
            x: 19,
            y: 31,
            r: [
              "...kkkk............kkkk.....",
              "..kwwkkk..........kwwkkk....",
              "..kwwkkk..........kwwkkk....",
              "..kkkkkk..........kkkkkk....",
              "..kOOOOk..........kOOOOk....",
              ".rrrrBOk..........kOBBOrrrr.",
              "rrrrrrk............kkkrrrrrr",
              ".rrrr..................rrrr.",
              ".............tt.............",
              ".........O......O...........",
              "..........O....O............",
              "...........OOOO............."
            ]
          },
          b_face_blink: {
            x: 19,
            y: 33,
            r: [
              "..kkkkkk..........kkkkkk....",
              "...kkkk............kkkk.....",
              "............................",
              ".rrrr..................rrrr.",
              "rrrrrr................rrrrrr",
              ".rrrr..................rrrr.",
              ".............tt.............",
              ".........O......O...........",
              "..........O....O............",
              "...........OOOO............."
            ]
          },
          b_face_sing: {
            x: 19,
            y: 31,
            r: [
              "...kkkk............kkkk.....",
              "..kwwkkk..........kwwkkk....",
              "..kwwkkk..........kwwkkk....",
              "..kkkkkk..........kkkkkk....",
              "..kOOOOk..........kOOOOk....",
              ".rrrrBOk..........kOBBOrrrr.",
              "rrrrrrk............kkkrrrrrr",
              ".rrrr..................rrrr.",
              ".............tt.............",
              "..........kkkkkk............",
              "..........kwwwwk............",
              "..........kRRRRk............",
              "...........kRRk.............",
              "............kk.............."
            ]
          },
          b_face_hit: {
            x: 19,
            y: 31,
            r: [
              "..k....k..........k....k....",
              "...k..k............k..k.....",
              "....kk..............kk......",
              "....kk..............kk......",
              "...k..k............k..k.....",
              ".rrrr..k..........k....rrrr.",
              "rrrrrr................rrrrrr",
              ".rrrr..................rrrr.",
              ".............tt.............",
              "...........kkkk.............",
              "..........k....k............",
              "...........kkkk............."
            ]
          },
          b_face_cheer: {
            x: 19,
            y: 34,
            r: [
              "...kkkk............kkkk.....",
              "..kk..kk..........kk..kk....",
              ".rrrr..k..........k....rrrr.",
              "rrrrrr................rrrrrr",
              ".rrrr..................rrrr.",
              ".............tt.............",
              "..........kkkkkk............",
              "..........kwwwwk............",
              "..........kRRRRk............",
              "...........kRRk.............",
              "............kk.............."
            ]
          }
        },
        anims: {
          idle: {
            loop: true,
            frames: [
              {
                d: 360,
                l: "bench bun:0,0 pin:0,0 skirt stand torso:0,0 head:0,0 face_smile:0,0 ear:0,0 kbd aL_a aR_a "
              },
              {
                d: 240,
                l: "bench bun:0,0 pin:0,0 skirt stand torso:0,0 head:0,0 face_smile:0,0 ear:0,0 kbd aL_a aR_a "
              },
              {
                d: 360,
                l: "bench bun:0,1 pin:0,1 skirt stand torso:0,1 head:0,1 face_smile:0,1 ear:0,1 kbd aL_a aR_a "
              },
              {
                d: 240,
                l: "bench bun:0,1 pin:0,1 skirt stand torso:0,1 head:0,1 face_smile:0,1 ear:0,1 kbd aL_a aR_a "
              }
            ]
          },
          stand: {
            loop: true,
            frames: [
              {
                d: 360,
                l: "bun:0,0 pin:0,0 skirtS  torso:0,0 head:0,0 face_smile:0,0 ear:0,0 aW_L:0,0 kbdc:0,0 aW_R:0,0"
              },
              {
                d: 240,
                l: "bun:0,0 pin:0,0 skirtS  torso:0,0 head:0,0 face_smile:0,0 ear:0,0 aW_L:0,0 kbdc:0,0 aW_R:0,0"
              },
              {
                d: 360,
                l: "bun:0,1 pin:0,1 skirtS  torso:0,1 head:0,1 face_smile:0,1 ear:0,1 aW_L:0,1 kbdc:0,1 aW_R:0,1"
              },
              {
                d: 240,
                l: "bun:0,1 pin:0,1 skirtS  torso:0,1 head:0,1 face_smile:0,1 ear:0,1 aW_L:0,1 kbdc:0,1 aW_R:0,1"
              }
            ]
          },
          perform: {
            loop: true,
            frames: [
              {
                d: 110,
                l: "bench bun:0,0 pin:0,0 skirt stand torso:0,0 head:0,0 face_play:0,0 ear:0,0 kbd aL_a aR_b press_a +fx/note_a_g:25,10"
              },
              {
                d: 110,
                l: "bench bun:0,1 pin:0,1 skirt stand torso:0,1 head:0,1 face_play:0,1 ear:0,1 kbd aL_b aR_a press_b +fx/note_b_w:25,7 +fx/twk_s_g:9,20"
              },
              {
                d: 110,
                l: "bench bun:0,0 pin:0,0 skirt stand torso:0,0 head:0,0 face_play:0,0 ear:0,0 kbd aL_c aR_b press_c +fx/note_c_g:25,4"
              },
              {
                d: 110,
                l: "bench bun:0,1 pin:0,1 skirt stand torso:0,1 head:0,1 face_play:0,1 ear:0,1 kbd aL_a aR_c press_d +fx/note_a_w:25,1 +fx/twk_s_g:22,21"
              },
              {
                d: 110,
                l: "bench bun:0,0 pin:0,0 skirt stand torso:0,0 head:0,0 face_smile:0,0 ear:0,0 kbd aL_b aR_a press_b +fx/note_b_g:25,12"
              },
              {
                d: 110,
                l: "bench bun:0,1 pin:0,1 skirt stand torso:0,1 head:0,1 face_play:0,1 ear:0,1 kbd aL_a aR_b press_a +fx/note_c_w:25,8"
              }
            ]
          },
          walk: {
            loop: true,
            frames: [
              {
                d: 130,
                l: "bun:0,0 pin:0,0 skirtS shoeA torso:0,0 head:0,0 face_smile:0,0 ear:0,0 aW_L:0,0 kbdc:0,0 aW_R:0,0"
              },
              {
                d: 130,
                l: "bun:0,-1 pin:0,-1 skirtS  torso:0,-1 head:0,-1 face_smile:0,-1 ear:0,-1 aW_L:0,-1 kbdc:0,-1 aW_R:0,-1"
              },
              {
                d: 130,
                l: "bun:0,0 pin:0,0 skirtS shoeB torso:0,0 head:0,0 face_smile:0,0 ear:0,0 aW_L:0,0 kbdc:0,0 aW_R:0,0"
              },
              {
                d: 130,
                l: "bun:0,-1 pin:0,-1 skirtS  torso:0,-1 head:0,-1 face_smile:0,-1 ear:0,-1 aW_L:0,-1 kbdc:0,-1 aW_R:0,-1"
              }
            ]
          },
          hit: {
            loop: false,
            frames: [
              {
                d: 90,
                l: "bench bun:-1,1 pin:-1,1 skirt stand torso:-1,1 head:-1,1 face_hit:-1,1 ear:-1,1 kbd:1,0 aL_up:-1,1 aR_up:-1,1 "
              },
              {
                d: 160,
                l: "bench bun:-1,0 pin:-1,0 skirt stand torso:-1,0 head:-1,0 face_hit:-1,0 ear:-1,0 kbd aL_b aR_b "
              }
            ]
          },
          cheer: {
            loop: true,
            frames: [
              {
                d: 120,
                l: "bench bun:0,0 pin:0,0 skirt stand torso:0,0 head:0,0 face_cheer:0,0 ear:0,0 kbd aL_up aR_up +fx/twk_s_g:3,8 +fx/twk_s_g:28,8"
              },
              {
                d: 110,
                l: "bench bun:0,-2 pin:0,-2 skirt stand torso:0,-2 head:0,-2 face_cheer:0,-2 ear:0,-2 kbd aL_up:0,-2 aR_up:0,-2 +fx/twk_m_g:2,6"
              },
              {
                d: 120,
                l: "bench bun:0,-3 pin:0,-3 skirt stand torso:0,-3 head:0,-3 face_cheer:0,-3 ear:0,-3 kbd aL_up:0,-3 aR_up:0,-3 +fx/twk_m_g:26,4 +fx/twk_s_g:3,4"
              },
              {
                d: 110,
                l: "bench bun:0,-1 pin:0,-1 skirt stand torso:0,-1 head:0,-1 face_cheer:0,-1 ear:0,-1 kbd aL_up:0,-1 aR_up:0,-1 +fx/twk_s_g:28,10"
              }
            ]
          },
          bust: {
            loop: true,
            frames: [
              { d: 2200, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_smile:0,0 b_front:0,0" },
              { d: 110, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_blink:0,0 b_front:0,0" },
              { d: 1600, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_smile:0,1 b_front:0,1" },
              { d: 110, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_blink:0,1 b_front:0,1" }
            ],
            w: 64,
            h: 64,
            ax: 32,
            ay: 63
          },
          bust_sing: {
            loop: true,
            frames: [
              { d: 400, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_sing:0,0 b_front:0,0" },
              { d: 400, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_sing:0,1 b_front:0,1" }
            ],
            w: 64,
            h: 64,
            ax: 32,
            ay: 63
          },
          bust_hit: {
            loop: true,
            frames: [
              { d: 400, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_hit:0,0 b_front:0,0" },
              { d: 400, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_hit:0,1 b_front:0,1" }
            ],
            w: 64,
            h: 64,
            ax: 32,
            ay: 63
          },
          bust_cheer: {
            loop: true,
            frames: [
              { d: 400, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_cheer:0,0 b_front:0,0" },
              { d: 400, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_cheer:0,1 b_front:0,1" }
            ],
            w: 64,
            h: 64,
            ax: 32,
            ay: 63
          }
        },
        label: "피아니스트"
      },
      cellist: {
        kind: "musician",
        w: 32,
        h: 32,
        ax: 16,
        ay: 31,
        pieces: {
          bun: {
            x: 11,
            y: 1,
            r: ["..dd..", "dddnnd", "dnmnnk", "dnnnnk", "dnnnnk", "dnnnkk", ".kkkk."]
          },
          ribbon: {
            x: 11,
            y: 5,
            r: ["bb", ".b"]
          },
          head: {
            x: 6,
            y: 4,
            r: [
              "....dddddddd....",
              "...ddmnnnndnn...",
              "..dnnmmnkdlnnn..",
              ".dnnmdnnknnddnk.",
              "dnndnnnnknnnnnnk",
              "dnmdknnnknnnknnk",
              "dndnnkssssnknnnk",
              "dnnnnsssssssnnnk",
              "dnnnsssssssssnnk",
              "dnssssssssssstkk",
              ".nssssssssssstk.",
              ".dssssssssssttk.",
              "..kssssssssttk..",
              "...ktsssstttk...",
              ".....kttttk....."
            ]
          },
          face_smile: {
            x: 9,
            y: 13,
            r: [".kk....kk.", ".wk....wk.", ".kn....kn.", "rr......rr", "....uu...."]
          },
          face_sing: {
            x: 9,
            y: 13,
            r: [".kk....kk.", ".wk....wk.", ".kn....kn.", "rr......rr", "....kk....", "....Rk...."]
          },
          face_play: {
            x: 9,
            y: 14,
            r: ["..kk...kk.", ".k.......k", "rr......rr", "....uu...."]
          },
          face_hit: {
            x: 10,
            y: 13,
            r: ["k.......k", ".kk...kk.", "k.......k", ".........", "...kk....", "...kk...."]
          },
          face_cheer: {
            x: 9,
            y: 13,
            r: ["..kk...kk.", ".k.......k", "..........", "rr.kkkk.rr", "...kRRk...", "....kk...."]
          },
          ear: {
            x: 6,
            y: 17,
            r: [
              "g..............g",
              "o..............o"
            ]
          },
          torso: {
            x: 10,
            y: 19,
            r: ["...tt...", "mdsssstn", "mddsstdn"]
          },
          skirt: {
            x: 7,
            y: 21,
            r: [
              ".....mmdddnn......",
              ".....mmdddnn......",
              "....mmddddnnn.....",
              "...mmdddndddnn....",
              "...mmdddndddnn....",
              "..mmddddndddnnn...",
              ".mmdddddndddgnnn..",
              ".mddddddndddddnnn.",
              "gogogogogogogogog."
            ]
          },
          cello: {
            x: 7,
            y: 20,
            r: [
              "....abbbbbBB....",
              "...abbbbbbbBB...",
              "....abbbbbBB....",
              "....abbbbbBB....",
              "..abbbkbbkbbBB..",
              ".abbbbkbbkbbbBB.",
              "abbbbbkbbkbbbbBB",
              "abbbbbkbOkbbbbBB",
              "abbbbbbbbbbbbbBB",
              ".abbbbbbbbbbbBB.",
              "..BBBBBBBBBBBB.."
            ]
          },
          strings: {
            x: 16,
            y: 19,
            r: ["yi", "yi", "yi", "yi", "yi", "yi", "yi", "yi", "yi"]
          },
          neck: {
            x: 21,
            y: 8,
            r: [".bb.", "bbbB", ".kO.", ".kO.", ".kO.", ".kO.", ".kO.", ".kO.", ".kO.", ".kO.", "kkOO", "kkOO"]
          },
          endpin: {
            x: 16,
            y: 30,
            r: ["O"]
          },
          bow: {
            x: 5,
            y: 27,
            r: [
              "OyyyyyyyyyyyyyyyyyyO"
            ]
          },
          armBow: {
            x: 6,
            y: 20,
            r: ["....l.", "...lmd", "...ldd", "..lmd.", "..lmd.", "..lmd.", ".lmdd.", "..dd..", "ssss..", "ssss..", "ssss..", ".ss..."],
            ol: "n"
          },
          armBow2: {
            x: 9,
            y: 20,
            r: [".l..", "lmd.", "lmd.", "lmd.", "lmm.", "lmmd", "lmdd", ".dd.", ".sss", "ssss", "ssss", ".sss"],
            ol: "n"
          },
          armFing: {
            x: 17,
            y: 10,
            r: ["......sss", ".....ssss", "......sss", "....llds.", "....lmd..", "...lmdd..", "..lmdd...", "..lmd....", ".lmdd....", ".ldd.....", "ldd......", "dd......."],
            ol: "n"
          },
          armFing2: {
            x: 17,
            y: 11,
            r: [".......s..", "......ssss", "......ssss", ".....lsss.", "....lmd...", "...lmdd...", "..lmdd....", ".lmdd.....", ".ldd......", "ldd.......", "dd........"],
            ol: "n"
          },
          armFing3: {
            x: 17,
            y: 13,
            r: ["........s.", "......ssss", "......ssss", "....lldsss", "...lmmd...", "..lmmdd...", ".lmddd....", "lddd......", "dd........"],
            ol: "n"
          },
          armV_L: {
            x: 0,
            y: 10,
            r: [".sss........", "ssss........", "ssss........", ".sssll......", "...lmml.....", "...lmmmd....", "....lmmm....", ".....lmml...", "......lmml..", ".......lmml.", "........lmmd", ".........ddd"],
            ol: "n"
          },
          armV_R: {
            x: 17,
            y: 10,
            r: [
              "..........ss.",
              ".........ssss",
              ".........ssss",
              ".......llssss",
              "......lmmd...",
              ".....lmmdd...",
              "....lmddd....",
              "...lmdd......",
              "..lmdd.......",
              ".lmdd........",
              "lddd.........",
              "dd..........."
            ],
            ol: "n"
          },
          armH_L: {
            x: 2,
            y: 15,
            r: ["sss.......", "ssss......", "ssslll....", ".s.lmml...", "...dmmmll.", ".....dmmmd", ".......ddd"],
            ol: "n"
          },
          armH_R: {
            x: 17,
            y: 17,
            r: [
              "...........sss.",
              "......lllldssss",
              "..llllmmmmdssss",
              "llmmmmddddd.ss.",
              "ddddddd........"
            ],
            ol: "n"
          },
          skirtS: {
            x: 7,
            y: 23,
            r: [
              "....mmddddnnn.....",
              "...mmdddndddnn....",
              "...mmdddndddnn....",
              "..mmddddndddnnn...",
              ".mmdddddndddgnnn..",
              ".mddddddndddddnnn.",
              "gogogogogogogogog."
            ]
          },
          celloBack: {
            x: 18,
            y: 4,
            r: [".....abbb..", ".....bbbb..", ".....bbbb..", "......OO...", "......OO...", "......OO...", "......OO...", "......OO...", "......OO...", "......OO...", "......OO...", "......OO...", "....aaOO...", "..aaabbbB..", ".aabbbbbBB.", ".abbbbbbbB.", ".abbbbbbbB.", "aabbkbkbbBB", "abbbkbkbBBB", "abbbbbbbBBB", ".bbbbbbbBB.", ".abbbbbBBB.", ".BbbbBBBBB.", "..BBBBBBB..", "....BBB...."]
          },
          aW_L: {
            x: 5,
            y: 20,
            r: ["....lld", "....ldd", "...lmd.", "...lmd.", "...lmd.", "..lmdd.", "..lmd..", "..ddd..", ".sss...", "ssss...", ".sss...", ".ss...."],
            ol: "n"
          },
          aW_R: {
            x: 17,
            y: 20,
            r: ["ll...", "lmd..", "lmd..", "lmm..", "lmmd.", ".lmd.", ".ldd.", "..ds.", "..sss", ".ssss", "..sss"],
            ol: "n"
          },
          bowS: {
            x: 26,
            y: 21,
            r: ["y", "y", "y", "y", "y", "y", "y"]
          },
          shoeA: {
            x: 9,
            y: 30,
            r: ["nn"]
          },
          shoeB: {
            x: 17,
            y: 30,
            r: ["nn"]
          },
          b_back: {
            x: 24,
            y: 0,
            r: [
              "...dddnnnnnnd........................",
              "..ddnnnnnnnnnk.......................",
              ".ddnnnbbnnnnnkk......................",
              ".dnnnmmbnnnnnkk......................",
              "ddnnnnnnnnnnnkkk.....................",
              "dnnnmmnnnnnnnkkk.....................",
              "dnnnnnnnnnnnnkkk.....................",
              "dnnnnnnnnnnnkkkk.....................",
              "dnnnnnnnnnnnkkkk.............bbbbbb..",
              "dnnnnnnnnnnkkkkk............aabbbbbB.",
              ".nnnnnnnnnkkkkk............bbbbbbbbBB",
              ".dnnnnnnkkkkkkk............bbbbbbbbBB",
              "..kkkkkkkkkkkk.............bbbbbkbBBB",
              "...kkkkkkkkkk..............bbbbbbBBBB",
              ".....kkkkkk.................BBBBBBBB.",
              ".............................BBBBBB..",
              ".....................................",
              ".....................................",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk..",
              "..............................BOOOk.."
            ]
          },
          b_torso: {
            x: 2,
            y: 42,
            r: [
              "...........................ssssss...........................",
              "........................ssssssssssss........................",
              ".......................ssuuuuuuuuuuss.......................",
              "......................sssuuuuuuuuuusst......................",
              ".....................ssssuuuuuuuuuussst.....................",
              ".....................ssssssssssttttssst.....................",
              "....................sssssssssssttttssstt....................",
              "...................msssssssssssttttsssttm...................",
              ".................mmmGssssssssssttttsstttdGm.................",
              "................mmddgssssssssssttttsstttgddd................",
              "..............mmmdddGssssssssssttttstttdGddddm..............",
              "............mmmdddddgssssssssssssssttttdGddddddm............",
              "..........mmmddddddddgssssssssssssttttdgdddddddddm..........",
              "........mmmdddddddddddGttssssssttttttdGddddddddddddm........",
              ".......mmdddddddddddddgGtttttaatttttdGgdddddddddddddd.......",
              ".....mmmddddddddddddddddgGdaaaaaaddGgdddddddddddddddddm.....",
              "....mmddddddgdddddddddddddgGgaaGgGgdddddddddddddddddddnn....",
              "...mmdddddddddddddddddddddddddgddddddddddddddddddddddddnn...",
              "..mmddddddddddddddddddddddddddddddddddddddddddddgdddddddnn..",
              "..mnnnnnnnnnnnnnnnnngnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn..",
              ".mmnnnngnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnngnnnnnnnnnnnnnnnn.",
              "omonononononononononononononononononononononononononogononon"
            ],
            ol: "n"
          },
          b_head: {
            x: 12,
            y: 4,
            r: [
              ".................dddddd.................",
              ".............dddddddddddddd.............",
              "..........dddddddddnnnnnnddddd..........",
              ".........ddddddnnnnlnnnnnnnnndd.........",
              ".......dddddnnnnnmmmnnnnnnnnnnnnd.......",
              "......dddddnnnnnnnnnnnnnnnnnnnnnnd......",
              ".....ddddnnnnnnnnnnnnnnnnnnnnnnnnnk.....",
              "....ddddnnnnnnnmnnnnknndddnnnnnnnnnk....",
              "...ddddGnnnnnmmnnnnnknnnndddnnnnndnkk...",
              "...dddGgGnnmmdnnnnnkknknnnndddnnnnnkk...",
              "..dddGggGnmddnnnnnnkknknnnnnndddnnnnkk..",
              ".dddnnggnddnnnnnnnknknnknnnnnnnnnnnnkkk.",
              ".ddnnngnddnnnnnnnnknknnknnnnnnnnnnnnnkk.",
              ".ddnnnnnddknnnnnnknnknnnknnnnnknnnnnnkk.",
              "dddnnnnddnnknnnnnknnknnnknnnnknnnnnnnkkk",
              "dddnnnnddnnnknnnnknnknnnknnnnknnnnnnnkkk",
              "ddnnnnddnnnnnknnknssssnnnknnknnnnnnnnkkk",
              "ddnnnddnnnnnnnnskssssssssknnnnnnnnnnnkkk",
              "ddnnnnnnnnnnnnsssssssssssssnnnnnnnnnnkkk",
              "ddnnnnnnnnnnnssssssssssssssssnnnnnnnnnkk",
              "ddnnnnnnnnnsssssssssssssssssssnnnnnnnnkk",
              "ddnnnnnnnnsssssssssssssssssssssnnnnnnnkk",
              "ddnnnnnnnsssssssssssssssssssssssnnnnnnkk",
              "ddnnnnnnsssssssssssssssssssssssssnnnnkkk",
              "ddnnssssssssssssssssssssssssssssssntkkkk",
              "ddnnssssssssssssssssssssssssssssstttkkkk",
              ".dnnssssssssssssssssssssssssssssstttkkk.",
              ".dnnssssssssssssssssssssssssssssstttkkk.",
              "..dnssssssssssssssssssssssssssssstttkk..",
              "..dnssssssssssssssssssssssssssssttttkk..",
              "...dnssssssssssssssssssssssssssstttkk...",
              "....nssssssssssssssssssssssssssttttk....",
              "....dssssssssssssssssssssssssstttttk....",
              ".....dssssssssssssssssssssssstttttk.....",
              ".......sssssssssssssssssssssttttt.......",
              "........tssssssssssssssssstttttt........",
              ".........ttsssssssssssssttttttt.........",
              "..........ttttsssssssttttttttt..........",
              "............tttttttttttttttt............",
              "...............tttttttttt...............",
              "..gG................................gG..",
              "..og................................og..",
              "..o.................................o..."
            ],
            ol: "k"
          },
          b_front: {
            x: 6,
            y: 50,
            r: [
              ".................................................OOOOOO",
              "......................................OOOOOOOOOOOyyyyyy",
              "...........................OOOOOOOOOOOyyyyyyyyyyy......",
              ".................OOOOOOOOOOyyyyyyyyyyy.................",
              "......OOOOOOOOOOOyyyyyyyyyy......aaaaaaaaaa............",
              "OOOOOOyyyyyyyyyyy.............aaaaaaaiyaaaaaaa.........",
              "yyyyyy......................aaaaaaabbiybbbbbbaaa.......",
              "..........................aaaakabbbbbiybbbbbbbkbaa.....",
              ".........................aaaaakbbbbbbiybbbbbbbkbbba....",
              "........................aaaabbkbbbbbbiybbbbbbbkbbbbB...",
              ".......................aaaabbbkbbbbbbiybbbbbbbkbbbbbB..",
              "......................aaaabbbbkbbbbbbiybbbbbbbkbbbbbBB.",
              "......................aaabbbbbbbbbbbbiybbbbbbbbbbbbbBB.",
              ".....................aaabbbbbbbbbbbbbiybbbbbbbbbbbbbBBB"
            ]
          },
          b_face_smile: {
            x: 19,
            y: 31,
            r: [
              "...kkkk............kkkk.....",
              "..kwwkkk..........kwwkkk....",
              "..kwwkkk..........kwwkkk....",
              "..kkkkkk..........kkkkkk....",
              "..kOOOOk..........kOOOOk....",
              ".rrrrBOk..........kOBBOrrrr.",
              "rrrrrrk............kkkrrrrrr",
              ".rrrr..................rrrr.",
              ".............tt.............",
              ".........O......O...........",
              "..........O....O............",
              "...........OOOO............."
            ]
          },
          b_face_blink: {
            x: 19,
            y: 33,
            r: [
              "..kkkkkk..........kkkkkk....",
              "...kkkk............kkkk.....",
              "............................",
              ".rrrr..................rrrr.",
              "rrrrrr................rrrrrr",
              ".rrrr..................rrrr.",
              ".............tt.............",
              ".........O......O...........",
              "..........O....O............",
              "...........OOOO............."
            ]
          },
          b_face_sing: {
            x: 19,
            y: 31,
            r: [
              "...kkkk............kkkk.....",
              "..kwwkkk..........kwwkkk....",
              "..kwwkkk..........kwwkkk....",
              "..kkkkkk..........kkkkkk....",
              "..kOOOOk..........kOOOOk....",
              ".rrrrBOk..........kOBBOrrrr.",
              "rrrrrrk............kkkrrrrrr",
              ".rrrr..................rrrr.",
              ".............tt.............",
              "..........kkkkkk............",
              "..........kwwwwk............",
              "..........kRRRRk............",
              "...........kRRk.............",
              "............kk.............."
            ]
          },
          b_face_hit: {
            x: 19,
            y: 31,
            r: [
              "..k....k..........k....k....",
              "...k..k............k..k.....",
              "....kk..............kk......",
              "....kk..............kk......",
              "...k..k............k..k.....",
              ".rrrr..k..........k....rrrr.",
              "rrrrrr................rrrrrr",
              ".rrrr..................rrrr.",
              ".............tt.............",
              "...........kkkk.............",
              "..........k....k............",
              "...........kkkk............."
            ]
          },
          b_face_cheer: {
            x: 19,
            y: 34,
            r: [
              "...kkkk............kkkk.....",
              "..kk..kk..........kk..kk....",
              ".rrrr..k..........k....rrrr.",
              "rrrrrr................rrrrrr",
              ".rrrr..................rrrr.",
              ".............tt.............",
              "..........kkkkkk............",
              "..........kwwwwk............",
              "..........kRRRRk............",
              "...........kRRk.............",
              "............kk.............."
            ]
          }
        },
        anims: {
          idle: {
            loop: true,
            frames: [
              {
                d: 360,
                l: "skirt neck bun:0,0 ribbon:0,0 torso:0,0 head:0,0 face_smile:0,0 ear:0,0 cello strings bow:0,0 armBow:0,0 armFing endpin"
              },
              {
                d: 240,
                l: "skirt neck bun:0,0 ribbon:0,0 torso:0,0 head:0,0 face_smile:0,0 ear:0,0 cello strings bow:0,0 armBow:0,0 armFing endpin"
              },
              {
                d: 360,
                l: "skirt neck bun:0,1 ribbon:0,1 torso:0,1 head:0,1 face_smile:0,1 ear:0,1 cello strings bow:0,0 armBow:0,0 armFing endpin"
              },
              {
                d: 240,
                l: "skirt neck bun:0,1 ribbon:0,1 torso:0,1 head:0,1 face_smile:0,1 ear:0,1 cello strings bow:0,0 armBow:0,0 armFing endpin"
              }
            ]
          },
          stand: {
            loop: true,
            frames: [
              {
                d: 360,
                l: "celloBack:0,0 skirtS  bun:0,0 ribbon:0,0 torso:0,0 head:0,0 face_smile:0,0 ear:0,0 aW_L:0,0 aW_R:0,0"
              },
              {
                d: 240,
                l: "celloBack:0,0 skirtS  bun:0,0 ribbon:0,0 torso:0,0 head:0,0 face_smile:0,0 ear:0,0 aW_L:0,0 aW_R:0,0"
              },
              {
                d: 360,
                l: "celloBack:0,1 skirtS  bun:0,1 ribbon:0,1 torso:0,1 head:0,1 face_smile:0,1 ear:0,1 aW_L:0,1 aW_R:0,1"
              },
              {
                d: 240,
                l: "celloBack:0,1 skirtS  bun:0,1 ribbon:0,1 torso:0,1 head:0,1 face_smile:0,1 ear:0,1 aW_L:0,1 aW_R:0,1"
              }
            ]
          },
          perform: {
            loop: true,
            frames: [
              {
                d: 120,
                l: "skirt neck bun:0,0 ribbon:0,0 torso:0,0 head:0,0 face_play:0,0 ear:0,0 cello strings bow:-2,0 armBow:-2,0 armFing2 +fx/note_a_g:0,12 endpin"
              },
              {
                d: 120,
                l: "skirt neck bun:0,1 ribbon:0,1 torso:0,1 head:0,1 face_play:0,1 ear:0,1 cello strings bow:-1,0 armBow:-1,0 armFing3 +fx/note_b_w:0,8 endpin"
              },
              {
                d: 120,
                l: "skirt neck bun:0,0 ribbon:0,0 torso:0,0 head:0,0 face_play:0,0 ear:0,0 cello strings bow:1,0 armBow2:1,0 armFing2 +fx/note_c_g:0,4 +fx/twk_s_g:24,22 endpin"
              },
              {
                d: 120,
                l: "skirt neck bun:0,1 ribbon:0,1 torso:0,1 head:0,1 face_play:0,1 ear:0,1 cello strings bow:3,0 armBow2:3,0 armFing +fx/note_a_w:26,12 endpin"
              },
              {
                d: 120,
                l: "skirt neck bun:0,0 ribbon:0,0 torso:0,0 head:0,0 face_play:0,0 ear:0,0 cello strings bow:1,0 armBow2:1,0 armFing2 +fx/note_b_g:26,8 endpin"
              },
              {
                d: 120,
                l: "skirt neck bun:0,1 ribbon:0,1 torso:0,1 head:0,1 face_play:0,1 ear:0,1 cello strings bow:-1,0 armBow:-1,0 armFing3 +fx/note_c_w:26,4 endpin"
              }
            ]
          },
          walk: {
            loop: true,
            frames: [
              {
                d: 130,
                l: "celloBack:0,0 skirtS shoeA bun:0,0 ribbon:0,0 torso:0,0 head:0,0 face_smile:0,0 ear:0,0 aW_L:0,0 aW_R:0,0"
              },
              {
                d: 130,
                l: "celloBack:0,-1 skirtS  bun:0,-1 ribbon:0,-1 torso:0,-1 head:0,-1 face_smile:0,-1 ear:0,-1 aW_L:0,-1 aW_R:0,-1"
              },
              {
                d: 130,
                l: "celloBack:0,0 skirtS shoeB bun:0,0 ribbon:0,0 torso:0,0 head:0,0 face_smile:0,0 ear:0,0 aW_L:0,0 aW_R:0,0"
              },
              {
                d: 130,
                l: "celloBack:0,-1 skirtS  bun:0,-1 ribbon:0,-1 torso:0,-1 head:0,-1 face_smile:0,-1 ear:0,-1 aW_L:0,-1 aW_R:0,-1"
              }
            ]
          },
          hit: {
            loop: false,
            frames: [
              {
                d: 90,
                l: "skirt neck:0,1 bun:-1,1 ribbon:-1,1 torso:-1,1 head:-1,1 face_hit:-1,1 ear:-1,1 cello strings bow:2,0 armH_L armH_R endpin"
              },
              {
                d: 160,
                l: "skirt neck bun:-1,0 ribbon:-1,0 torso:-1,0 head:-1,0 face_hit:-1,0 ear:-1,0 cello strings bow:1,0 armBow:1,0 armFing endpin"
              }
            ]
          },
          cheer: {
            loop: true,
            frames: [
              {
                d: 120,
                l: "skirt neck bun:0,0 ribbon:0,0 torso:0,0 head:0,0 face_cheer:0,0 ear:0,0 cello strings bow:0,0 armV_L armV_R +fx/twk_s_g:2,10 +fx/twk_s_g:27,9 endpin"
              },
              {
                d: 110,
                l: "skirt neck bun:0,-2 ribbon:0,-2 torso:0,-2 head:0,-2 face_cheer:0,-2 ear:0,-2 cello strings bow:0,0 armV_L armV_R +fx/twk_m_g:1,8 endpin"
              },
              {
                d: 120,
                l: "skirt neck bun:0,-3 ribbon:0,-3 torso:0,-3 head:0,-3 face_cheer:0,-3 ear:0,-3 cello strings bow:0,0 armV_L armV_R +fx/twk_m_g:26,8 +fx/twk_s_g:3,6 endpin"
              },
              {
                d: 110,
                l: "skirt neck bun:0,-1 ribbon:0,-1 torso:0,-1 head:0,-1 face_cheer:0,-1 ear:0,-1 cello strings bow:0,0 armV_L armV_R +fx/twk_s_g:27,11 endpin"
              }
            ]
          },
          bust: {
            loop: true,
            frames: [
              { d: 2200, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_smile:0,0 b_front:0,0" },
              { d: 110, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_blink:0,0 b_front:0,0" },
              { d: 1600, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_smile:0,1 b_front:0,1" },
              { d: 110, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_blink:0,1 b_front:0,1" }
            ],
            w: 64,
            h: 64,
            ax: 32,
            ay: 63
          },
          bust_sing: {
            loop: true,
            frames: [
              { d: 400, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_sing:0,0 b_front:0,0" },
              { d: 400, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_sing:0,1 b_front:0,1" }
            ],
            w: 64,
            h: 64,
            ax: 32,
            ay: 63
          },
          bust_hit: {
            loop: true,
            frames: [
              { d: 400, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_hit:0,0 b_front:0,0" },
              { d: 400, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_hit:0,1 b_front:0,1" }
            ],
            w: 64,
            h: 64,
            ax: 32,
            ay: 63
          },
          bust_cheer: {
            loop: true,
            frames: [
              { d: 400, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_cheer:0,0 b_front:0,0" },
              { d: 400, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_cheer:0,1 b_front:0,1" }
            ],
            w: 64,
            h: 64,
            ax: 32,
            ay: 63
          }
        },
        label: "첼리스트"
      },
      flutist: {
        kind: "musician",
        w: 32,
        h: 32,
        ax: 16,
        ay: 31,
        pieces: {
          bun: {
            x: 6,
            y: 9,
            r: ["..dd..", ".ddnn.", "ddmnnk", "dnnnnk", "dnnnkk", ".nnkk.", "..kk.."]
          },
          pin: {
            x: 8,
            y: 9,
            r: ["G.", "gg", ".g"]
          },
          head: {
            x: 8,
            y: 2,
            r: [
              "....dddddddd....",
              "...ddmnnnnnnn...",
              "..dmnnnldndnnn..",
              ".ddnnddnnkndmnk.",
              "ddnnnknnnnknndnk",
              "dnnnnnknnnknndmk",
              "dnmsssksnnnknndk",
              "dnssssssssnknnnk",
              "dnsssssssssnnnnk",
              "dnssssssssssstkk",
              ".nssssssssssstk.",
              ".dssssssssssttk.",
              "..kssssssssttk..",
              "...ktsssstttk...",
              ".....kttttk....."
            ]
          },
          face_smile: {
            x: 11,
            y: 11,
            r: [".kk....kk.", ".wk....wk.", ".kn....kn.", "rr......rr", "....uu...."]
          },
          face_sing: {
            x: 11,
            y: 11,
            r: [".kk....kk.", ".wk....wk.", ".kn....kn.", "rr......rr", "....kk....", "....Rk...."]
          },
          face_play: {
            x: 11,
            y: 12,
            r: ["..kk...kk.", ".k.......k", "rr......rr", "....uu...."]
          },
          face_hit: {
            x: 12,
            y: 11,
            r: ["k.......k", ".kk...kk.", "k.......k", ".........", "...kk....", "...kk...."]
          },
          face_cheer: {
            x: 11,
            y: 11,
            r: ["..kk...kk.", ".k.......k", "..........", "rr.kkkk.rr", "...kRRk...", "....kk...."]
          },
          ear: {
            x: 9,
            y: 15,
            r: ["C", "c"]
          },
          torso: {
            x: 12,
            y: 17,
            r: ["...tt...", "mdsssstn", "mdCsscdn", ".mdCCdn.", ".mddddn.", "..mdddn.", "CCCCCCCC"]
          },
          skirt: {
            x: 7,
            y: 21,
            r: [
              ".....mmdddnn......",
              ".....mmdddnn......",
              "....mmddddnnn.....",
              "...mmdddndddnn....",
              "...mmdddndddnn....",
              "..mmddddndddnnn...",
              ".mmdddddndddCnnn..",
              ".mddddddndddddnnn.",
              "CcCcCcCcCcCcCcCcC."
            ]
          },
          slit: {
            x: 21,
            y: 26,
            r: ["tt", "tt", "tt", "O."]
          },
          flute: {
            x: 12,
            y: 17,
            r: [
              "wccwccwccwccwccwccl",
              "CCCCACCACCACCACCACA"
            ],
            ol: "d"
          },
          hL: {
            x: 15,
            y: 17,
            r: ["ss", "st"]
          },
          hR: {
            x: 24,
            y: 17,
            r: ["ss", "st"]
          },
          hL2: {
            x: 16,
            y: 17,
            r: ["ss", "st"]
          },
          hR2: {
            x: 25,
            y: 17,
            r: ["ss", "st"]
          },
          aL: {
            x: 13,
            y: 18,
            r: [".sss", "ssss", "tstt"],
            ol: "u"
          },
          aR: {
            x: 19,
            y: 18,
            r: ["....sss", "ssstsss", "ttttstt"],
            ol: "u"
          },
          aL2: {
            x: 13,
            y: 18,
            r: ["..sss", "sssss", "ttstt"],
            ol: "u"
          },
          aR2: {
            x: 19,
            y: 18,
            r: [".....sss", "sssstsss", "tttttstt"],
            ol: "u"
          },
          aL_up: {
            x: 6,
            y: 13,
            r: ["sss.....", "sss.....", "sttt....", "...tt...", "....tt..", ".....ttt", "......tt"],
            ol: "u"
          },
          aR_up: {
            x: 19,
            y: 12,
            r: [".....sss", ".....sss", "....sstt", "...stt..", "..stt...", ".stt....", "stt.....", "tt......"],
            ol: "u"
          },
          aH_L: {
            x: 7,
            y: 18,
            r: ["sss....", "sssssst", "stttttt"],
            ol: "u"
          },
          aH_R: {
            x: 19,
            y: 19,
            r: ["ss.......", "tsss.....", "..ttsssss", ".....tsss", "......stt"],
            ol: "u"
          },
          fluteV: {
            x: 26,
            y: 17,
            r: ["wC", "cC", "lC", "cC", "cC", "lC", "cC", "cC", "lC", "cC", "cC"]
          },
          aW_R: {
            x: 19,
            y: 19,
            r: ["s........", "tsss.....", "..tssss..", "....ttsss", ".......ss"],
            ol: "u"
          },
          aW_L0: {
            x: 9,
            y: 19,
            r: ["....t", "...tt", "..tt.", "sss..", "sss..", "stt.."],
            ol: "u"
          },
          aW_L1: {
            x: 10,
            y: 19,
            r: ["...t", "..st", ".stt", "sss.", "sss."],
            ol: "u"
          },
          shoeA: {
            x: 10,
            y: 30,
            r: ["nn"]
          },
          shoeB: {
            x: 19,
            y: 30,
            r: ["nn"]
          },
          b_back: {
            x: 4,
            y: 29,
            r: [
              "....dddddd....",
              "...ddnnnnnn...",
              "..ddnnnnnnnk..",
              ".ddnnnnnnnnkk.",
              "ddnnmmnnnnnkkk",
              "dnnnmmnnnnnkkk",
              "dnnnnnnnnnnkkk",
              "dnnnnnnnnnkkkk",
              "dnnnnnnnnkkkkk",
              "dnnnnnnnkkkkkk",
              ".nnnnnnkkkkkk.",
              "..kkkkkkkkkk..",
              "...kkkkkkkk...",
              "....kkkkkk...."
            ]
          },
          b_torso: {
            x: 2,
            y: 42,
            r: [
              "...........................ssssss...........................",
              "........................ssssssssssss........................",
              ".......................ssuuuuuuuuuuss.......................",
              "......................sssuuuuuuuuuusst......................",
              ".....................ssssuuuuuuuuuussst.....................",
              ".....................ssssssssssttttssst.....................",
              "....................sssssssssssttttssstt....................",
              "...................msssssssssssttttsssttm...................",
              ".................mmmGssssssssssttttsstttdGm.................",
              "................mmddgssssssssssttttsstttgddd................",
              "..............mmmdddGssssssssssttttstttdGddddm..............",
              "............mmmdddddgssssssssssssssttttdGddddddm............",
              "..........mmmddddddddgssssssssssssttttdgdddddddddm..........",
              "........mmmdddddddddddGttssssssttttttdGddddddddddddm........",
              ".......mmdddddddddddddgGtttttCCtttttdGgdddddddddddddd.......",
              ".....mmmddddddddddddddddgGdCCCCCCddGgdddddddddddddddddm.....",
              "....mmddddddgdddddddddddddgGgCCGgGgdddddddddddddddddddnn....",
              "...mmdddddddddddddddddddddddddgddddddddddddddddddddddddnn...",
              "..mmddddddddddddddddddddddddddddddddddddddddddddgdddddddnn..",
              "..mnnnnnnnnnnnnnnnnngnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn..",
              ".mmnnnngnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnngnnnnnnnnnnnnnnnn.",
              "omonononononononononononononononononononononononononogononon"
            ],
            ol: "n"
          },
          b_head: {
            x: 12,
            y: 4,
            r: [
              ".................dddddd.................",
              ".............dddddddddddddd.............",
              "..........dddddddddnnnnnnddddd..........",
              ".........ddddddnnnnlnnnnnnnnndd.........",
              ".......dddddnnnnnmmnnnnnnnnnnnnnd.......",
              "......dddddnnmnnnnnnnnnnnnnnnnnnnd......",
              ".....ddddnmmnnnnnnnnnnnnnnnnnnnnnnk.....",
              "....ddddmmmnnnnnnnnnnnnnndddnnnnnnnk....",
              "...ddddnnnnnnnnnnnndddnknnndddnnndnkk...",
              "...dddnnnnnnnnndddddnnnknnnnndmdnnnkk...",
              "..dddnnnnnnnndddnnnnnnnnknnnnnndddnnkk..",
              ".ddddnnnnnnnnnnnnnnnnnnnknnnnnnnnddnnkk.",
              ".dddnnnnnnnnnknnnnnnnnnnnknnnnnnnnnnnkk.",
              ".ddnnnnnnnnnnnknnnnnnnnnnknnnnnnnddnnkk.",
              "dddnnnnnnnnnnnknnnnnnnnnnnknnnnnnddnnkkk",
              "ddnnnnnnnnnnnnnknnnnnnnnnnknnnnnnnddnkkk",
              "ddnnnnnnnnnnsssksnnnnnnnnnnknnnnnnddnnkk",
              "ddnnnnmmnsssssssksssnnnnnnnknnnnnnnddnkk",
              "ddnnnnmmssssssssssssssnnnnnnknnnnnnnnnkk",
              "ddnnnnmssssssssssssssssnnnnnknnnnnnnnnkk",
              "ddnnnnsssssssssssssssssssnnnnnnnnnnnnnkk",
              "ddnnnssssssssssssssssssssssnnnnnnnnnnnkk",
              "ddnnnsssssssssssssssssssssssnnnnnnnnnnkk",
              "ddnnnsssssssssssssssssssssssssnnnnnnnnkk",
              "ddnnsssssssssssssssssssssssssssnnnntkkkk",
              "ddnnssssssssssssssssssssssssssssstttkkkk",
              ".dnnssssssssssssssssssssssssssssstttkkk.",
              ".dnnssssssssssssssssssssssssssssstttkkk.",
              "..dnssssssssssssssssssssssssssssstttkk..",
              "..dnssssssssssssssssssssssssssssttttkk..",
              "..Gdnssssssssssssssssssssssssssstttkk...",
              ".GgGnssssssssssssssssssssssssssttttk....",
              "GggGdssssssssssssssssssssssssstttttk....",
              ".gg..dssssssssssssssssssssssstttttk.....",
              ".g.....sssssssssssssssssssssttttt.......",
              "........tssssssssssssssssstttttt........",
              ".........ttsssssssssssssttttttt.........",
              "..........ttttsssssssttttttttt..........",
              "............tttttttttttttttt............",
              "...............tttttttttt...............",
              "..gG................................cC..",
              "..og................................Cc..",
              "..o.................................o..."
            ],
            ol: "k"
          },
          b_front: {
            x: 18,
            y: 51,
            r: [
              "..ssss........................................",
              ".ssssss.ll......ll......ll......ll......ll....",
              "sssssssswwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwll",
              "ssssssssccccccccccccccttccccccccccccccccccccll",
              "CssssssCCCCCCCCCCCCCCCtsCCCCCCCCCCCCCCCCCCCCll",
              "CCssssCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCll",
              "........AA......AA......AA......AA......AA...."
            ]
          },
          b_face_smile: {
            x: 19,
            y: 31,
            r: [
              "...kkkk............kkkk.....",
              "..kwwkkk..........kwwkkk....",
              "..kwwkkk..........kwwkkk....",
              "..kkkkkk..........kkkkkk....",
              "..kOOOOk..........kOOOOk....",
              ".rrrrBOk..........kOBBOrrrr.",
              "rrrrrrk............kkkrrrrrr",
              ".rrrr..................rrrr.",
              ".............tt.............",
              ".........O......O...........",
              "..........O....O............",
              "...........OOOO............."
            ]
          },
          b_face_blink: {
            x: 19,
            y: 33,
            r: [
              "..kkkkkk..........kkkkkk....",
              "...kkkk............kkkk.....",
              "............................",
              ".rrrr..................rrrr.",
              "rrrrrr................rrrrrr",
              ".rrrr..................rrrr.",
              ".............tt.............",
              ".........O......O...........",
              "..........O....O............",
              "...........OOOO............."
            ]
          },
          b_face_sing: {
            x: 19,
            y: 31,
            r: [
              "...kkkk............kkkk.....",
              "..kwwkkk..........kwwkkk....",
              "..kwwkkk..........kwwkkk....",
              "..kkkkkk..........kkkkkk....",
              "..kOOOOk..........kOOOOk....",
              ".rrrrBOk..........kOBBOrrrr.",
              "rrrrrrk............kkkrrrrrr",
              ".rrrr..................rrrr.",
              ".............tt.............",
              "..........kkkkkk............",
              "..........kwwwwk............",
              "..........kRRRRk............",
              "...........kRRk.............",
              "............kk.............."
            ]
          },
          b_face_hit: {
            x: 19,
            y: 31,
            r: [
              "..k....k..........k....k....",
              "...k..k............k..k.....",
              "....kk..............kk......",
              "....kk..............kk......",
              "...k..k............k..k.....",
              ".rrrr..k..........k....rrrr.",
              "rrrrrr................rrrrrr",
              ".rrrr..................rrrr.",
              ".............tt.............",
              "...........kkkk.............",
              "..........k....k............",
              "...........kkkk............."
            ]
          },
          b_face_cheer: {
            x: 19,
            y: 34,
            r: [
              "...kkkk............kkkk.....",
              "..kk..kk..........kk..kk....",
              ".rrrr..k..........k....rrrr.",
              "rrrrrr................rrrrrr",
              ".rrrr..................rrrr.",
              ".............tt.............",
              "..........kkkkkk............",
              "..........kwwwwk............",
              "..........kRRRRk............",
              "...........kRRk.............",
              "............kk.............."
            ]
          }
        },
        anims: {
          idle: {
            loop: true,
            frames: [
              {
                d: 360,
                l: "bun:0,0 pin:0,0 skirt slit torso:0,0 head:0,0 face_smile:0,0 ear:0,0 aL:0,0 aR:0,0 flute:0,0 hL:0,0 hR:0,0 "
              },
              {
                d: 240,
                l: "bun:0,0 pin:0,0 skirt slit torso:0,0 head:0,0 face_smile:0,0 ear:0,0 aL:0,0 aR:0,0 flute:0,0 hL:0,0 hR:0,0 "
              },
              {
                d: 360,
                l: "bun:0,1 pin:0,1 skirt slit torso:0,1 head:0,1 face_smile:0,1 ear:0,1 aL:0,1 aR:0,1 flute:0,1 hL:0,1 hR:0,1 "
              },
              {
                d: 240,
                l: "bun:0,1 pin:0,1 skirt slit torso:0,1 head:0,1 face_smile:0,1 ear:0,1 aL:0,1 aR:0,1 flute:0,1 hL:0,1 hR:0,1 "
              }
            ]
          },
          stand: { alias: "idle" },
          perform: {
            loop: true,
            frames: [
              {
                d: 110,
                l: "bun:0,0 pin:0,0 skirt slit torso:0,0 head:0,0 face_play:0,0 ear:0,0 aL aR flute:0,0 hL:0,0 hR:0,0 +fx/note_a_g:25,8"
              },
              {
                d: 110,
                l: "bun:0,0 pin:0,0 skirt slit torso:0,0 head:0,0 face_play:0,0 ear:0,0 aL2:0,-1 aR:0,-1 flute:0,-1 hL2:0,-2 hR:0,-2 +fx/note_b_w:25,5"
              },
              {
                d: 110,
                l: "bun:0,0 pin:0,0 skirt slit torso:0,0 head:0,0 face_play:0,0 ear:0,0 aL aR2 flute:0,0 hL:0,0 hR2:0,0 +fx/note_c_g:25,2"
              },
              {
                d: 110,
                l: "bun:0,0 pin:0,0 skirt slit torso:0,0 head:0,0 face_play:0,0 ear:0,0 aL2:0,-1 aR2:0,-1 flute:0,-1 hL2:0,-2 hR2:0,-2 +fx/note_a_w:22,10"
              },
              {
                d: 110,
                l: "bun:0,0 pin:0,0 skirt slit torso:0,0 head:0,0 face_play:0,0 ear:0,0 aL aR flute:0,0 hL:0,0 hR:0,0 +fx/note_b_g:26,6 +fx/twk_s_g:29,14"
              },
              {
                d: 110,
                l: "bun:0,0 pin:0,0 skirt slit torso:0,0 head:0,0 face_smile:0,0 ear:0,0 aL:0,-1 aR2:0,-1 flute:0,-1 hL:0,-1 hR2:0,-2 +fx/note_c_w:25,3"
              }
            ]
          },
          walk: {
            loop: true,
            frames: [
              {
                d: 130,
                l: "bun:0,0 pin:0,0 skirt shoeA slit torso:0,0 head:0,0 face_smile:0,0 ear:0,0 fluteV:0,0 aW_L0:0,0 aW_R:0,0"
              },
              {
                d: 130,
                l: "bun:0,-1 pin:0,-1 skirt  slit torso:0,-1 head:0,-1 face_smile:0,-1 ear:0,-1 fluteV:0,-1 aW_L1:0,-1 aW_R:0,-1"
              },
              {
                d: 130,
                l: "bun:0,0 pin:0,0 skirt shoeB slit torso:0,0 head:0,0 face_smile:0,0 ear:0,0 fluteV:0,0 aW_L0:0,0 aW_R:0,0"
              },
              {
                d: 130,
                l: "bun:0,-1 pin:0,-1 skirt  slit torso:0,-1 head:0,-1 face_smile:0,-1 ear:0,-1 fluteV:0,-1 aW_L1:0,-1 aW_R:0,-1"
              }
            ]
          },
          hit: {
            loop: false,
            frames: [
              {
                d: 90,
                l: "bun:-1,1 pin:-1,1 skirt slit torso:-1,1 head:-1,1 face_hit:-1,1 ear:-1,1 aH_L aH_R "
              },
              {
                d: 160,
                l: "bun:-1,0 pin:-1,0 skirt slit torso:-1,0 head:-1,0 face_hit:-1,0 ear:-1,0 aL:-1,0 aR:-1,0 flute:-1,0 hL:-1,0 hR:-1,0 "
              }
            ]
          },
          cheer: {
            loop: true,
            frames: [
              {
                d: 120,
                l: "bun:0,0 pin:0,0 skirt slit torso:0,0 head:0,0 face_cheer:0,0 ear:0,0 aL_up aR_up +fx/twk_s_g:3,8 +fx/twk_s_g:28,8"
              },
              {
                d: 110,
                l: "bun:0,-2 pin:0,-2 skirt slit torso:0,-2 head:0,-2 face_cheer:0,-2 ear:0,-2 aL_up aR_up +fx/twk_m_g:2,6"
              },
              {
                d: 120,
                l: "bun:0,-3 pin:0,-3 skirt slit torso:0,-3 head:0,-3 face_cheer:0,-3 ear:0,-3 aL_up aR_up +fx/twk_m_g:26,4 +fx/twk_s_g:3,4"
              },
              {
                d: 110,
                l: "bun:0,-1 pin:0,-1 skirt slit torso:0,-1 head:0,-1 face_cheer:0,-1 ear:0,-1 aL_up aR_up +fx/twk_s_g:28,10"
              }
            ]
          },
          bust: {
            loop: true,
            frames: [
              { d: 2200, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_smile:0,0 b_front:0,0" },
              { d: 110, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_blink:0,0 b_front:0,0" },
              { d: 1600, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_smile:0,1 b_front:0,1" },
              { d: 110, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_blink:0,1 b_front:0,1" }
            ],
            w: 64,
            h: 64,
            ax: 32,
            ay: 63
          },
          bust_sing: {
            loop: true,
            frames: [
              { d: 400, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_sing:0,0 b_front:0,0" },
              { d: 400, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_sing:0,1 b_front:0,1" }
            ],
            w: 64,
            h: 64,
            ax: 32,
            ay: 63
          },
          bust_hit: {
            loop: true,
            frames: [
              { d: 400, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_hit:0,0 b_front:0,0" },
              { d: 400, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_hit:0,1 b_front:0,1" }
            ],
            w: 64,
            h: 64,
            ax: 32,
            ay: 63
          },
          bust_cheer: {
            loop: true,
            frames: [
              { d: 400, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_cheer:0,0 b_front:0,0" },
              { d: 400, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_cheer:0,1 b_front:0,1" }
            ],
            w: 64,
            h: 64,
            ax: 32,
            ay: 63
          }
        },
        label: "플루티스트"
      },
      trumpeter: {
        kind: "musician",
        w: 32,
        h: 32,
        ax: 13,
        ay: 31,
        pieces: {
          bun: {
            x: 4,
            y: 3,
            r: ["..dd.", "dddnk", "dnmnk", "dnnnk", "dnnkk", ".kkk."]
          },
          pin: {
            x: 5,
            y: 4,
            r: ["G.", "gg", ".g"]
          },
          head: {
            x: 5,
            y: 2,
            r: [
              "....dddddddd....",
              "...ddmnnnnnnn...",
              "..dmnnnldndnnn..",
              ".ddnnddnnkndmnk.",
              "ddnnnknnnnknndnk",
              "dnnnnnknnnknndmk",
              "dnmsssksnnnknndk",
              "dnssssssssnknnnk",
              "dnsssssssssnnnnk",
              "dnssssssssssstkk",
              ".nssssssssssstk.",
              ".dssssssssssttk.",
              "..kssssssssttk..",
              "...ktsssstttk...",
              ".....kttttk....."
            ]
          },
          face_smile: {
            x: 8,
            y: 11,
            r: [".kk....kk.", ".wk....wk.", ".kn....kn.", "rr......rr", "....uu...."]
          },
          face_sing: {
            x: 8,
            y: 11,
            r: [".kk....kk.", ".wk....wk.", ".kn....kn.", "rr......rr", "....kk....", "....Rk...."]
          },
          face_play: {
            x: 8,
            y: 12,
            r: ["..kk...kk.", ".k.......k", "rr......rr", "....uu...."]
          },
          face_hit: {
            x: 9,
            y: 11,
            r: ["k.......k", ".kk...kk.", "k.......k", ".........", "...kk....", "...kk...."]
          },
          face_cheer: {
            x: 8,
            y: 11,
            r: ["..kk...kk.", ".k.......k", "..........", "rr.kkkk.rr", "...kRRk...", "....kk...."]
          },
          ear: {
            x: 20,
            y: 15,
            r: ["g", "o"]
          },
          torso: {
            x: 8,
            y: 17,
            r: ["....tt....", "mddwttwddn", "mddwaawddn", "mgddaaddgn", "mdddaadddn", "mddgddgddn", "mddddddddn", "nnnnnnnnnn"]
          },
          legL: {
            x: 8,
            y: 25,
            r: ["mddn", "mddn", "mddn", "mddn", "mddn"]
          },
          legR: {
            x: 14,
            y: 25,
            r: ["mddn", "mddn", "mddn", "mddn", "mddn"]
          },
          shoeL: {
            x: 7,
            y: 30,
            r: ["lnnnn"]
          },
          shoeR: {
            x: 14,
            y: 30,
            r: ["lnnnn"]
          },
          legL2: {
            x: 8,
            y: 25,
            r: ["mddn", "mddn", "mddn", "mddn"]
          },
          legR2: {
            x: 14,
            y: 25,
            r: ["mddn", "mddn", "mddn", "mddn"]
          },
          shoeLu: {
            x: 7,
            y: 29,
            r: ["lnnnn"]
          },
          shoeRu: {
            x: 14,
            y: 29,
            r: ["lnnnn"]
          },
          trumpet: {
            x: 14,
            y: 10,
            r: [
              "...............G.",
              ".............GGGO",
              "............ggggO",
              "...G.G.G...gggggO",
              "...o.o.o.gggggggO",
              "GgGgGgGgggggggggO",
              "ooooooooogggggggO",
              "..o......oggggggO",
              "..gggggggo.oggggO",
              "..oooooooo...oogO",
              "...............o."
            ],
            ol: "k"
          },
          hV: {
            x: 17,
            y: 16,
            r: ["ss", "st"]
          },
          hB: {
            x: 23,
            y: 18,
            r: ["ss", "st"]
          },
          armV: {
            x: 9,
            y: 14,
            r: [
              "...........sss",
              "........llssss",
              "......llmmssss",
              "...lllmmmddss.",
              ".llmmmdddd....",
              "lmmdddd.......",
              "dddd.........."
            ],
            ol: "n"
          },
          armV2: {
            x: 9,
            y: 15,
            r: [
              "...........ss.",
              "........llssss",
              ".....lllmmssss",
              ".llllmmmmddsss",
              "lmmmdddddd....",
              "ddddd........."
            ],
            ol: "n"
          },
          armB: {
            x: 16,
            y: 17,
            r: [
              "......lll.sss",
              "..llllmmmssss",
              "llmmmmmmddsss",
              "ddddddddd..s."
            ],
            ol: "n"
          },
          armB2: {
            x: 16,
            y: 18,
            r: [
              "....lllll.sss",
              "llllmmmmmssss",
              "dddmmmmmdssss",
              "....ddddd.sss"
            ],
            ol: "n"
          },
          armUp_L: {
            x: 0,
            y: 9,
            r: ["ss.........", "sss........", "sss........", "sssll......", "..lmml.....", "..lmmml....", "...lmmml...", "....lmmmd..", ".....lmmm..", "......dmml.", "........lmd", ".........dd"],
            ol: "n"
          },
          armUp_R: {
            x: 16,
            y: 8,
            r: [
              "..........ss.",
              ".........ssss",
              ".........ssss",
              ".......llsss.",
              "......lmmd...",
              ".....lmmdd...",
              "....lmmdd....",
              "...lmmdd.....",
              "..lmmdd......",
              "..lmdd.......",
              ".lddd........",
              "ldd..........",
              "dd..........."
            ],
            ol: "n"
          },
          armH_L: {
            x: 0,
            y: 17,
            r: ["ss.........", "sssllllll..", "ssslmmmmmld", "sssdddddddd"],
            ol: "n"
          },
          armH_R: {
            x: 16,
            y: 19,
            r: [
              "llll..........",
              "lmmmllll......",
              ".ddmmmmmld....",
              "....dmmmmdsss.",
              "......ddddssss",
              "..........sss.",
              "...........s.."
            ],
            ol: "n"
          },
          hornTip: {
            x: 30,
            y: 10,
            r: ["G"]
          },
          b_back: {
            x: 7,
            y: 11,
            r: [
              "....dddddd....",
              "...ddnnnnnn...",
              "..ddnnnnnnnk..",
              ".ddnnnnnnnnkk.",
              "ddnnmmnnnnnkkk",
              "dnnnmmnnnnnkkk",
              "dnnnnnnnnnnkkk",
              "dnnnnnnnnnkkkk",
              "dnnnnnnnnkkkkk",
              "dnnnnnnnkkkkkk",
              ".nnnnnnkkkkkk.",
              "..kkkkkkkkkk..",
              "...kkkkkkkk...",
              "....kkkkkk...."
            ]
          },
          b_torso: {
            x: 2,
            y: 42,
            r: [
              "...........................ssssss...........................",
              "........................ssssssssssss........................",
              ".......................ssuuuuuuuuuuss.......................",
              "......................sssuuuuuuuuuusst......................",
              ".....................ssssuuuuuuuuuussst.....................",
              ".....................ssssssssssttttssst.....................",
              "....................sssssssssssttttssstt....................",
              "...................msssssssssssttttsssttm...................",
              ".................mmmGswwwssssssttttwwwttdGm.................",
              "................mmddgsswwssssssttttwwtttgddd................",
              "..............mmmdddGssswssssssttttwtttdGddddm..............",
              "............mmmdddddgsssswwwwsswwwwttttdGddddddm............",
              "..........mmmddddddddgsssswwwwwwwwttttdgdddddddddm..........",
              "........mmmdddddddddddGttswwaaabwwtttdGddddddddddddm........",
              ".......mmdddddddddddddgGtttwaaabwtttdGgdddddddddddddd.......",
              ".....mmmddddddddddddddddgGdtaaabtddGgdddddddddddddddddm.....",
              "....mmddddddgdddddddddddddgGggabgGgdddddddddddddddddddnn....",
              "...mmddddddddddddddddddddddaaaabdddddddddddddddddddddddnn...",
              "..mmdddddddddddddddddddddddaaaabbdddddddddddddddgdddddddnn..",
              "..mnnnnnnnnnnnnnnnnngnnnnnnaaaabbnnnnnnnnnnnnnnnnnnnnnnnnn..",
              ".mmnnnngnnnnnnnnnnnnnnnnnnnaaaabbnnnnnnnnngnnnnnnnnnnnnnnnn.",
              "omononononononononononononoaaaabbnonononononononononogononon"
            ],
            ol: "n"
          },
          b_head: {
            x: 10,
            y: 4,
            r: [
              "...................dddddd.................",
              "...............dddddddddddddd.............",
              "............dddddddddnnnnnnddddd..........",
              "...........ddddddnnnnlnnnnnnnnndd.........",
              ".........dddddnnnnnmmnnnnnnnnnnnnnd.......",
              "........dddddnnmnnnnnnnnnnnnnnnnnnnd......",
              ".......ddddnmmnnnnnnnnnnnnnnnnnnnnnnk.....",
              "......ddddmmmnnnnnnnnnnnnnndddnnnnnnnk....",
              ".....ddddnnnnnnnnnnnndddnknnndddnnndnkk...",
              ".....dddnnnnnnnnndddddnnnknnnnndmdnnnkk...",
              "..G.dddnnnnnnnndddnnnnnnnnknnnnnndddnnkk..",
              ".GgGdddnnnnnnnnnnnnnnnnnnnknnnnnnnnddnnkk.",
              "GggGddnnnnnnnnnknnnnnnnnnnnknnnnnnnnnnnkk.",
              ".ggddnnnnnnnnnnnknnnnnnnnnnknnnnnnnddnnkk.",
              ".gdddnnnnnnnnnnnknnnnnnnnnnnknnnnnnddnnkkk",
              "..ddnnnnnnnnnnnnnknnnnnnnnnnknnnnnnnddnkkk",
              "..ddnnnnnnnnnnsssksnnnnnnnnnnknnnnnnddnnkk",
              "..ddnnnnmmnsssssssksssnnnnnnnknnnnnnnddnkk",
              "..ddnnnnmmssssssssssssssnnnnnnknnnnnnnnnkk",
              "..ddnnnnmssssssssssssssssnnnnnknnnnnnnnnkk",
              "..ddnnnnsssssssssssssssssssnnnnnnnnnnnnnkk",
              "..ddnnnssssssssssssssssssssssnnnnnnnnnnnkk",
              "..ddnnnsssssssssssssssssssssssnnnnnnnnnnkk",
              "..ddnnnsssssssssssssssssssssssssnnnnnnnnkk",
              "..ddnnsssssssssssssssssssssssssssnnnntkkkk",
              "..ddnnssssssssssssssssssssssssssssstttkkkk",
              "...dnnssssssssssssssssssssssssssssstttkkk.",
              "...dnnssssssssssssssssssssssssssssstttkkk.",
              "....dnssssssssssssssssssssssssssssstttkk..",
              "....dnssssssssssssssssssssssssssssttttkk..",
              ".....dnssssssssssssssssssssssssssstttkk...",
              "......nssssssssssssssssssssssssssttttk....",
              "......dssssssssssssssssssssssssstttttk....",
              ".......dssssssssssssssssssssssstttttk.....",
              ".........sssssssssssssssssssssttttt.......",
              "..........tssssssssssssssssstttttt........",
              "...........ttsssssssssssssttttttt.........",
              "............ttttsssssssttttttttt..........",
              "..............tttttttttttttttt............",
              ".................tttttttttt...............",
              "......................................gG..",
              "......................................og..",
              "......................................o..."
            ],
            ol: "k"
          },
          b_front: {
            x: 26,
            y: 30,
            r: [
              "....................................G.",
              "...................................GG.",
              "..................................OOG.",
              "................................GOOOO.",
              "...............................GGOOOO.",
              ".............................GGGGOOOO.",
              "............................GGGGOkkOOO",
              "...........................GGGGGOkkOOO",
              ".........................GGGGGGGOkkOOO",
              "........................GGGGGGGgOkkOOO",
              ".......................GGGGGGgggkkkkOO",
              "......................GGGGGGggggkkkkOO",
              ".....................GGGGGggggggkkkkOO",
              "....................GGGGggggggggkkkkOO",
              "..................GGGGGgggggggggkkkkOO",
              ".................GGGGgggggggggggkkkkOO",
              "................GGGgggggggggggggkkkkOO",
              "....Go.Go.Go...GGGggggggggggggggkkkkOO",
              "....oo.oo.oo..GGggggggggggggggggkkkkOO",
              "....oo.oo.oo.GggggggggggggggggggkkkkOO",
              "....oo.oo.ooGoggggggggggggggggggkkkkOO",
              "....oo.oo.ooooooooggggggggggggggkkkkOO",
              "GGGGGGGGGGGGGGooooooooggggggggggOkkOOO",
              "ggggggggggggggooooooooooooggggggOkkOOO",
              "oooooooooooooo.oooooooooooooooggOkkOOO",
              "......................ooooooooooOkkOOO",
              "...........................ooooooOOOO.",
              ".............................ooooOOOO.",
              "...............................ooOOOO.",
              "................................ooOOo.",
              "..................................ooo.",
              "....................................o."
            ]
          },
          b_face_smile: {
            x: 19,
            y: 31,
            r: [
              "...kkkk............kkkk.....",
              "..kwwkkk..........kwwkkk....",
              "..kwwkkk..........kwwkkk....",
              "..kkkkkk..........kkkkkk....",
              "..kOOOOk..........kOOOOk....",
              ".rrrrBOk..........kOBBOrrrr.",
              "rrrrrrk............kkkrrrrrr",
              ".rrrr..................rrrr.",
              ".............tt.............",
              ".........O......O...........",
              "..........O....O............",
              "...........OOOO............."
            ]
          },
          b_face_blink: {
            x: 19,
            y: 33,
            r: [
              "..kkkkkk..........kkkkkk....",
              "...kkkk............kkkk.....",
              "............................",
              ".rrrr..................rrrr.",
              "rrrrrr................rrrrrr",
              ".rrrr..................rrrr.",
              ".............tt.............",
              ".........O......O...........",
              "..........O....O............",
              "...........OOOO............."
            ]
          },
          b_face_sing: {
            x: 19,
            y: 31,
            r: [
              "...kkkk............kkkk.....",
              "..kwwkkk..........kwwkkk....",
              "..kwwkkk..........kwwkkk....",
              "..kkkkkk..........kkkkkk....",
              "..kOOOOk..........kOOOOk....",
              ".rrrrBOk..........kOBBOrrrr.",
              "rrrrrrk............kkkrrrrrr",
              ".rrrr..................rrrr.",
              ".............tt.............",
              "..........kkkkkk............",
              "..........kwwwwk............",
              "..........kRRRRk............",
              "...........kRRk.............",
              "............kk.............."
            ]
          },
          b_face_hit: {
            x: 19,
            y: 31,
            r: [
              "..k....k..........k....k....",
              "...k..k............k..k.....",
              "....kk..............kk......",
              "....kk..............kk......",
              "...k..k............k..k.....",
              ".rrrr..k..........k....rrrr.",
              "rrrrrr................rrrrrr",
              ".rrrr..................rrrr.",
              ".............tt.............",
              "...........kkkk.............",
              "..........k....k............",
              "...........kkkk............."
            ]
          },
          b_face_cheer: {
            x: 19,
            y: 34,
            r: [
              "...kkkk............kkkk.....",
              "..kk..kk..........kk..kk....",
              ".rrrr..k..........k....rrrr.",
              "rrrrrr................rrrrrr",
              ".rrrr..................rrrr.",
              ".............tt.............",
              "..........kkkkkk............",
              "..........kwwwwk............",
              "..........kRRRRk............",
              "...........kRRk.............",
              "............kk.............."
            ]
          }
        },
        anims: {
          idle: {
            loop: true,
            frames: [
              {
                d: 360,
                l: "bun:0,0 pin:0,0 legL legR shoeL shoeR torso:0,0 head:0,0 face_smile:0,0 ear:0,0 armV:0,0 armB:0,0 trumpet:0,0 hV:0,0 hB:0,0 "
              },
              {
                d: 240,
                l: "bun:0,0 pin:0,0 legL legR shoeL shoeR torso:0,0 head:0,0 face_smile:0,0 ear:0,0 armV:0,0 armB:0,0 trumpet:0,0 hV:0,0 hB:0,0 "
              },
              {
                d: 360,
                l: "bun:0,1 pin:0,1 legL legR shoeL shoeR torso:0,1 head:0,1 face_smile:0,1 ear:0,1 armV:0,1 armB:0,1 trumpet:0,1 hV:0,1 hB:0,1 "
              },
              {
                d: 240,
                l: "bun:0,1 pin:0,1 legL legR shoeL shoeR torso:0,1 head:0,1 face_smile:0,1 ear:0,1 armV:0,1 armB:0,1 trumpet:0,1 hV:0,1 hB:0,1 "
              }
            ]
          },
          stand: { alias: "idle" },
          perform: {
            loop: true,
            frames: [
              {
                d: 100,
                l: "bun:0,0 pin:0,0 legL legR shoeL shoeR torso:0,0 head:0,0 face_play:0,0 ear:0,0 armV armB trumpet:0,0 hV:0,0 hB:0,0 +fx/note_a_g:23,0"
              },
              {
                d: 100,
                l: "bun:0,0 pin:0,0 legL legR shoeL shoeR torso:0,0 head:0,0 face_play:0,0 ear:0,0 armV2:0,-1 armB:0,-1 trumpet:0,-1 hV:0,0 hB:0,-1 +fx/note_b_g:22,1 +fx/wave_s:26,1"
              },
              {
                d: 100,
                l: "bun:0,0 pin:0,0 legL legR shoeL shoeR torso:0,0 head:0,0 face_play:0,0 ear:0,0 armV armB2 trumpet:0,0 hV:0,0 hB:0,1 +fx/note_c_w:24,0"
              },
              {
                d: 100,
                l: "bun:0,0 pin:0,0 legL legR shoeL shoeR torso:0,0 head:0,0 face_play:0,0 ear:0,0 armV2:0,-1 armB2:0,-1 trumpet:0,-1 hV:0,0 hB:0,0 +fx/wave_m:26,3 +fx/note_a_w:22,1"
              },
              {
                d: 100,
                l: "bun:0,0 pin:0,0 legL legR shoeL shoeR torso:0,0 head:0,0 face_play:0,0 ear:0,0 armV armB trumpet:0,0 hV:0,0 hB:0,0 +fx/note_b_w:23,0"
              },
              {
                d: 100,
                l: "bun:0,0 pin:0,0 legL legR shoeL shoeR torso:0,0 head:0,0 face_smile:0,0 ear:0,0 armV2:0,-1 armB:0,-1 trumpet:0,-1 hV:0,0 hB:0,-1 +fx/note_c_g:25,0 +fx/wave_s:27,2"
              }
            ]
          },
          walk: {
            loop: true,
            frames: [
              {
                d: 130,
                l: "bun:0,0 pin:0,0 legL:0,-1 legR shoeLu shoeR torso:0,0 head:0,0 face_smile:0,0 ear:0,0 trumpet:0,5 armH_L:0,0 armB2:0,4"
              },
              {
                d: 130,
                l: "bun:0,-1 pin:0,-1 legL legR shoeL shoeR torso:0,-1 head:0,-1 face_smile:0,-1 ear:0,-1 trumpet:0,4 armH_L:0,-1 armB2:0,3"
              },
              {
                d: 130,
                l: "bun:0,0 pin:0,0 legL legR:0,-1 shoeL shoeRu torso:0,0 head:0,0 face_smile:0,0 ear:0,0 trumpet:0,5 armH_L:0,0 armB2:0,4"
              },
              {
                d: 130,
                l: "bun:0,-1 pin:0,-1 legL legR shoeL shoeR torso:0,-1 head:0,-1 face_smile:0,-1 ear:0,-1 trumpet:0,4 armH_L:0,-1 armB2:0,3"
              }
            ]
          },
          hit: {
            loop: false,
            frames: [
              {
                d: 90,
                l: "bun:-1,1 pin:-1,1 legL legR shoeL shoeR torso:-1,1 head:-1,1 face_hit:-1,1 ear:-1,1 armH_L armH_R "
              },
              {
                d: 160,
                l: "bun:-1,0 pin:-1,0 legL legR shoeL shoeR torso:-1,0 head:-1,0 face_hit:-1,0 ear:-1,0 armV:-1,0 armB:-1,0 trumpet:-1,0 hV:-1,0 hB:-1,0 "
              }
            ]
          },
          cheer: {
            loop: true,
            frames: [
              {
                d: 120,
                l: "bun:0,0 pin:0,0 legL legR shoeL shoeR torso:0,0 head:0,0 face_cheer:0,0 ear:0,0 armUp_L armUp_R +fx/twk_s_g:2,8"
              },
              {
                d: 110,
                l: "bun:0,-2 pin:0,-2 legL2 legR2 shoeLu shoeRu torso:0,-2 head:0,-2 face_cheer:0,-2 ear:0,-2 armUp_L armUp_R +fx/twk_m_g:1,6 +fx/twk_s_g:26,7"
              },
              {
                d: 120,
                l: "bun:0,-3 pin:0,-3 legL2 legR2 shoeLu shoeRu torso:0,-3 head:0,-3 face_cheer:0,-3 ear:0,-3 armUp_L armUp_R +fx/twk_m_g:25,3"
              },
              {
                d: 110,
                l: "bun:0,-1 pin:0,-1 legL2 legR2 shoeLu shoeRu torso:0,-1 head:0,-1 face_cheer:0,-1 ear:0,-1 armUp_L armUp_R +fx/twk_s_g:2,6"
              }
            ]
          },
          bust: {
            loop: true,
            frames: [
              { d: 2200, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_smile:0,0 b_front:0,0" },
              { d: 110, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_blink:0,0 b_front:0,0" },
              { d: 1600, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_smile:0,1 b_front:0,1" },
              { d: 110, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_blink:0,1 b_front:0,1" }
            ],
            w: 64,
            h: 64,
            ax: 32,
            ay: 63
          },
          bust_sing: {
            loop: true,
            frames: [
              { d: 400, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_sing:0,0 b_front:0,0" },
              { d: 400, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_sing:0,1 b_front:0,1" }
            ],
            w: 64,
            h: 64,
            ax: 32,
            ay: 63
          },
          bust_hit: {
            loop: true,
            frames: [
              { d: 400, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_hit:0,0 b_front:0,0" },
              { d: 400, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_hit:0,1 b_front:0,1" }
            ],
            w: 64,
            h: 64,
            ax: 32,
            ay: 63
          },
          bust_cheer: {
            loop: true,
            frames: [
              { d: 400, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_cheer:0,0 b_front:0,0" },
              { d: 400, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_cheer:0,1 b_front:0,1" }
            ],
            w: 64,
            h: 64,
            ax: 32,
            ay: 63
          }
        },
        label: "트럼페터"
      },
      harpist: {
        kind: "musician",
        w: 32,
        h: 32,
        ax: 20,
        ay: 31,
        pieces: {
          head: {
            x: 13,
            y: 2,
            r: [
              "....dddddddd....",
              "...ddmnnnndnn...",
              "..dnnmmnkdlnnn..",
              ".dnnmdnnknnddnk.",
              "dnndnnnnknnnnnnk",
              "dnmdknnnknnnknnk",
              "dndnnkssssnknnnk",
              "dnnnnsssssssnnnk",
              "dnnnsssssssssnnk",
              "dnssssssssssstkk",
              ".nssssssssssstk.",
              ".dssssssssssttk.",
              "..kssssssssttk..",
              "...ktsssstttk...",
              ".....kttttk....."
            ]
          },
          face_smile: {
            x: 16,
            y: 11,
            r: [".kk....kk.", ".wk....wk.", ".kn....kn.", "rr......rr", "....uu...."]
          },
          face_sing: {
            x: 16,
            y: 11,
            r: [".kk....kk.", ".wk....wk.", ".kn....kn.", "rr......rr", "....kk....", "....Rk...."]
          },
          face_play: {
            x: 16,
            y: 12,
            r: ["..kk...kk.", ".k.......k", "rr......rr", "....uu...."]
          },
          face_hit: {
            x: 17,
            y: 11,
            r: ["k.......k", ".kk...kk.", "k.......k", ".........", "...kk....", "...kk...."]
          },
          face_cheer: {
            x: 16,
            y: 11,
            r: ["..kk...kk.", ".k.......k", "..........", "rr.kkkk.rr", "...kRRk...", "....kk...."]
          },
          pin: {
            x: 14,
            y: 4,
            r: [".p", "pp", "p."]
          },
          ear: {
            x: 14,
            y: 15,
            r: [
              "g.............g",
              "o.............o"
            ]
          },
          hairb: {
            x: 27,
            y: 12,
            r: ["dnnk", "dmnk", "dnnk", ".dnk", ".dnk", "dmnk", "dnnk", ".dnk", ".dnk", ".dmk", "dnk.", "dnk.", ".dk."]
          },
          torso: {
            x: 17,
            y: 17,
            r: ["...tt...", "mdsssstn", "mdpsspdn", ".mdppdn.", ".mddddn.", "..mdddn.", "..pppppp"]
          },
          skirt: {
            x: 12,
            y: 21,
            r: [
              ".....mmdddnn......",
              ".....mmdddnn......",
              "....mmddddnnn.....",
              "...mmdddndddnn....",
              "...mmdddndddnn....",
              "..mmddddndddnnn...",
              ".mmdddddndddgnnn..",
              ".mddddddndddddnnn.",
              "gogogogogogogogog."
            ]
          },
          harp: {
            x: 0,
            y: 3,
            r: [
              ".......GGGGGGgG",
              ".....GGgggggggo",
              "....Ggggg...ggo",
              "...Gggg.....ggo",
              "...ggg....c.ggo",
              "..Ggg...C.c.go.",
              "..Ggo.c.C.c.go.",
              "..GGO.c.C.c.go.",
              "..Ggo.c.C.c.go.",
              "..Ggo.c.C.c.go.",
              "..Ggo.c.C.cggo.",
              "..GGO.c.C.cggo.",
              "..Ggo.c.C.cggo.",
              "..Ggo.c.C.cggo.",
              "..Ggo.c.C.cggo.",
              "..GGO.c.C.cggo.",
              "..Ggo.c.C.cggo.",
              "..Ggo.c.C.cgo..",
              "..Ggo.c.C.cgo..",
              "..GGO.c.C.cgo..",
              "..Ggo.c.C.cgo..",
              "..Ggo.c.C.cgo..",
              "..Ggo.c.C.ggo..",
              "..GGO.c.C.ggo..",
              "..Ggo.c.C.ggo..",
              ".GgggGGG..ggo..",
              ".oooooooo..o...",
              "OOOOOOOOO......"
            ]
          },
          aL_a: {
            x: 11,
            y: 16,
            r: ["sss.....", "ssss....", "sttttt..", "....tttt", ".......t"],
            ol: "O"
          },
          aR_a: {
            x: 10,
            y: 19,
            r: [
              "............st",
              ".......ssttttt",
              ".ssssttttt....",
              "sssstt........",
              ".st..........."
            ],
            ol: "O"
          },
          aL_b: {
            x: 10,
            y: 13,
            r: [".ss......", "ssss.....", ".sttt....", "...ttt...", "....ttt..", ".....ttt.", ".......tt", "........t"],
            ol: "O"
          },
          aR_b: {
            x: 11,
            y: 18,
            r: [
              "sss..........",
              "sssssssssssst",
              "stt.ttttttttt"
            ],
            ol: "O"
          },
          aL_c: {
            x: 10,
            y: 18,
            r: ["sss......", "sssssssst", "stttttttt"],
            ol: "O"
          },
          aR_c: {
            x: 10,
            y: 19,
            r: [
              ".............t",
              "..........sttt",
              ".......stttt..",
              ".....sttt.....",
              ".sstttt.......",
              "ssss..........",
              ".st..........."
            ],
            ol: "O"
          },
          aL_d: {
            x: 11,
            y: 15,
            r: ["sss.....", "ssss....", "..ttt...", "....ttt.", ".....ttt", ".......t"],
            ol: "O"
          },
          aR_d: {
            x: 10,
            y: 19,
            r: [
              "...........sst",
              "sssssssttttttt",
              "sssttttt......",
              "stt..........."
            ],
            ol: "O"
          },
          aL_up: {
            x: 10,
            y: 11,
            r: ["sss......", "sss......", "sttt.....", "..ttt....", "...ttt...", "....ttt..", ".....ttt.", "......ttt", ".......tt"],
            ol: "O"
          },
          aR_up: {
            x: 23,
            y: 11,
            r: [".....sss", ".....sss", "....sstt", "....tt..", "...tt...", "..tt....", ".tt.....", "st......", "tt......"],
            ol: "O"
          },
          aH_L: {
            x: 12,
            y: 19,
            r: [".....st", "ssstttt", "ssst...", "stt...."],
            ol: "O"
          },
          aH_R: {
            x: 23,
            y: 19,
            r: ["ss.......", "tsss.....", "..ttsssss", ".....tsss", "......stt"],
            ol: "O"
          },
          gl_a: {
            x: 6,
            y: 14,
            r: ["w"]
          },
          gl_b: {
            x: 8,
            y: 19,
            r: ["w"]
          },
          gl_c: {
            x: 10,
            y: 12,
            r: ["w"]
          },
          gl_d: {
            x: 6,
            y: 22,
            r: ["w"]
          },
          gl_e: {
            x: 8,
            y: 10,
            r: ["w"]
          },
          miniharp: {
            x: 8,
            y: 13,
            r: ["...ggggg.", "..ggggggg", ".ggg...gg", ".Go.c.cgg", ".Go.c.cgg", ".Go.c.cgg", ".Go.c.cgg", ".Go.c.cgg", ".Go.c.cgg", ".Go.c.cgg", ".Go.c.cgg", ".Go.c.cgg", ".Go.c.cgg", ".Go...ggg", "ooooooooo"]
          },
          aW_L: {
            x: 14,
            y: 19,
            r: ["....t", "...tt", "..tt.", "sss..", "sss..", "stt.."],
            ol: "O"
          },
          aW_R: {
            x: 23,
            y: 19,
            r: ["s...", "st..", "ss..", ".st.", ".sss", ".sss"],
            ol: "O"
          },
          shoeA: {
            x: 15,
            y: 30,
            r: ["nn"]
          },
          shoeB: {
            x: 23,
            y: 30,
            r: ["nn"]
          },
          b_back: {
            x: 4,
            y: 20,
            r: [
              "......knnnnnnn............................nnnnnnnk......",
              "......knnnnnnn............................nnnnnnnk......",
              "......knnnnnnn............................nnnnnnnk......",
              ".....knnnnnnnn............................nnnnnnnnk.....",
              "....kknnnnnnnn............................nnnnnnnnkk....",
              "....kkmnnnnnnn............................nnnnnnnnkk....",
              "...kknnnnnnnnn............................nnnnnnnnnkk...",
              "...kknnnnnnnnn............................nnnnnnnnnkk...",
              "..kkknnnnnnnnn............................nnnnnnnnnkkk..",
              ".kkknnnnnnnnnn............................nnnnnnnnnnkkk.",
              ".kkknnnnnnnnnn............................nnnnnnnnnnkkk.",
              ".kkknnnnnnnnnn............................nnnnnnnnnnkkk.",
              ".kkknnnnnnnnnn............................nnnnnnnnnnkkk.",
              ".kkknnnnnnnnnn............................nnnnnnnnnnkkk.",
              ".kkknnnnnnnnnn............................nnnnnnnnnnkkk.",
              "..kkknnnnnnnnn............................nnnnnnnnnkkk..",
              "..kkknnnnnnnnn............................nnnnnnnnnkkk..",
              "...kknnnnnnnnn............................nnnnnnnnnkk...",
              "...kkknnnnnnnn............................nnnnnnnnkkk...",
              "....kknnnnnnnn............................nnnnnnnnkk....",
              "....kkmnnnnnnn............................nnnnnnnnkk....",
              ".....kknnnnnnn............................nnnnnnnkk.....",
              ".....kknnnnnnn............................nnnnnnnkk.....",
              ".....kknnnnnnn............................nnnnnnnkk.....",
              ".....kknnnnnnn............................nnnnnnnkk.....",
              ".....kkmnnnnnn............................nnnnnnnkk.....",
              ".....kknnnnnnn............................nnnnnnnkk.....",
              "....kkknnnnnnn............................nnnnnnnkkk....",
              "....kknnnnnnnn............................nnnnnnnnkk....",
              "...kkknnnnnnnn............................nnnnnnnnkkk...",
              "...kkknnnnnnnn............................nnnnnnnnkkk...",
              "..kkknnnnnnnnn............................nnnnnnnnnkkk..",
              ".kkkknnnnnnnnn............................nnnnnnnnnkkkk.",
              ".kkkknnnnnnnnn............................nnnnnnnnnkkkk.",
              "kkkknnnnnnnnnn............................nnnnnnnnnnkkkk",
              "kkkknnnnnnnnnn............................nnnnnnnnnnkkkk",
              "kkkknnnnnnnnnn............................nnnnnnnnnnkkkk",
              "kkkknnnnnnnnnn............................nnnnnnnnnnkkkk",
              "kkkknnnnnnnnnn............................nnnnnnnnnnkkkk",
              "kkkknnnnnnnnnn............................nnnnnnnnnnkkkk",
              "kkkkknnnnnnnnn............................nnnnnnnnnkkkkk",
              ".kkkknnnnnnnnn............................nnnnnnnnnkkkk.",
              ".kkkknnnnnnnnn............................nnnnnnnnnkkkk."
            ]
          },
          b_torso: {
            x: 2,
            y: 42,
            r: [
              "...........................ssssss...........................",
              "........................ssssssssssss........................",
              ".......................ssuuuuuuuuuuss.......................",
              "......................sssuuuuuuuuuusst......................",
              ".....................ssssuuuuuuuuuussst.....................",
              ".....................ssssssssssttttssst.....................",
              "....................sssssssssssttttssstt....................",
              "...................msssssssssssttttsssttm...................",
              ".................mmmGssssssssssttttsstttdGm.................",
              "................mmddgssssssssssttttsstttgddd................",
              "..............mmmdddGssssssssssttttstttdGddddm..............",
              "............mmmdddddgssssssssssssssttttdGddddddm............",
              "..........mmmddddddddgssssssssssssttttdgdddddddddm..........",
              "........mmmdddddddddddGttssssssttttttdGddddddddddddm........",
              ".......mmdddddddddddddgGtttttpptttttdGgdddddddddddddd.......",
              ".....mmmddddddddddddddddgGdppppppddGgdddddddddddddddddm.....",
              "....mmddddddgdddddddddddddgGgppGgGgdddddddddddddddddddnn....",
              "...mmdddddddddddddddddddddddddgddddddddddddddddddddddddnn...",
              "..mmddddddddddddddddddddddddddddddddddddddddddddgdddddddnn..",
              "..mnnnnnnnnnnnnnnnnngnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn..",
              ".mmnnnngnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnngnnnnnnnnnnnnnnnn.",
              "omonononononononononononononononononononononononononogononon"
            ],
            ol: "n"
          },
          b_head: {
            x: 12,
            y: 4,
            r: [
              ".................dddddd.................",
              ".............dddddddddddddd.............",
              "..........dddddddddnnnnnnddddd..........",
              ".........ddddddnnnnlnnnnnnnnndd.........",
              ".......dddddnnnnnmmmnnnnnnnnnnnnd.......",
              "......dddddnnnnnnnnnnnnnnnnnnnnnnd......",
              ".....ddddnnnnnnnnnnnnnnnnnnnnnnnnnG.....",
              "....ddddnnnnnnnmnnnnknndddnnnnnnnGgG....",
              "...ddddnnnnnnmmnnnnnknnnndddnnnnGgpPk...",
              "...dddnnnnnmmdnnnnnkknknnnndddnnngPpk...",
              "..dddnnnnnmddnnnnnnkknknnnnnndddngnnkk..",
              ".dddnnnnnddnnnnnnnknknnknnnnnnnnnnnnkkk.",
              ".ddnnnnnddnnnnnnnnknknnknnnnnnnnnnnnnkk.",
              ".ddnnnnnddknnnnnnknnknnnknnnnnknnnnnnkk.",
              "dddnnnnddnnknnnnnknnknnnknnnnknnnnnnnkkk",
              "dddnnnnddnnnknnnnknnknnnknnnnknnnnnnnkkk",
              "ddnnnnddnnnnnknnknssssnnnknnknnnnnnnnkkk",
              "ddnnnddnnnnnnnnskssssssssknnnnnnnnnnnkkk",
              "ddnnnnnnnnnnnnsssssssssssssnnnnnnnnnnkkk",
              "ddnnnnnnnnnnnssssssssssssssssnnnnnnnnnkk",
              "ddnnnnnnnnnsssssssssssssssssssnnnnnnnnkk",
              "ddnnnnnnnnsssssssssssssssssssssnnnnnnnkk",
              "ddnnnnnnnsssssssssssssssssssssssnnnnnnkk",
              "ddnnnnnnsssssssssssssssssssssssssnnnnkkk",
              "ddnnssssssssssssssssssssssssssssssntkkkk",
              "ddnnssssssssssssssssssssssssssssstttkkkk",
              ".dnnssssssssssssssssssssssssssssstttkkk.",
              ".dnnssssssssssssssssssssssssssssstttkkk.",
              "..dnssssssssssssssssssssssssssssstttkk..",
              "..dnssssssssssssssssssssssssssssttttkk..",
              "...dnssssssssssssssssssssssssssstttkk...",
              "....nssssssssssssssssssssssssssttttk....",
              "....dssssssssssssssssssssssssstttttk....",
              ".....dssssssssssssssssssssssstttttk.....",
              ".......sssssssssssssssssssssttttt.......",
              "........tssssssssssssssssstttttt........",
              ".........ttsssssssssssssttttttt.........",
              "..........ttttsssssssttttttttt..........",
              "............tttttttttttttttt............",
              "...............tttttttttt..............."
            ],
            ol: "k"
          },
          b_front: {
            x: 0,
            y: 2,
            r: [
              "..................gggg.........",
              ".............gggggggggggggg....",
              "........ggggggggggggggggGGGGGGG",
              "......ggggggGGGGGGGGGGGGgggggg.",
              ".....gGGGGGGgggggggggggggggggg.",
              ".....ggggggggggggggggggggggggg.",
              ".....gggggggggggggg......ggggg.",
              "....gggggggggggg.............oo",
              "....gggggggggg.....C...c.oooo..",
              "....ggggggg....c...C.oooo......",
              "...ggggggg.C...c..ooo..c.......",
              "...gggggg..C..oooo.C...c.......",
              "...Gggggg.oooo.c...C...c.......",
              "...Gggggoo.C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo...C...c...C...c.......",
              "...Ggggo.......................",
              "...Ggggo.......................",
              "...Ggggo.......................",
              ".oooooooooooo..................",
              ".oooooooooooo..................",
              "OOOOOOOOOOOOOO.................",
              "OOOOOOOOOOOOOO................."
            ]
          },
          b_face_smile: {
            x: 14,
            y: 31,
            r: [
              "........kkkk............kkkk........",
              ".......kwwkkk..........kwwkkk.......",
              ".......kwwkkk..........kwwkkk.......",
              ".......kkkkkk..........kkkkkk.......",
              ".......kOOOOk..........kOOOOk.......",
              "......rrrrBOk..........kOBBOrrrr....",
              ".....rrrrrrk............kkkrrrrrr...",
              "......rrrr..................rrrr....",
              "..................tt................",
              "..............O......O..............",
              "...............O....O...............",
              "................OOOO................",
              "....................................",
              "gG................................gG",
              "og................................og",
              "o.................................o."
            ]
          },
          b_face_blink: {
            x: 14,
            y: 33,
            r: [
              ".......kkkkkk..........kkkkkk.......",
              "........kkkk............kkkk........",
              "....................................",
              "......rrrr..................rrrr....",
              ".....rrrrrr................rrrrrr...",
              "......rrrr..................rrrr....",
              "..................tt................",
              "..............O......O..............",
              "...............O....O...............",
              "................OOOO................",
              "....................................",
              "gG................................gG",
              "og................................og",
              "o.................................o."
            ]
          },
          b_face_sing: {
            x: 14,
            y: 31,
            r: [
              "........kkkk............kkkk........",
              ".......kwwkkk..........kwwkkk.......",
              ".......kwwkkk..........kwwkkk.......",
              ".......kkkkkk..........kkkkkk.......",
              ".......kOOOOk..........kOOOOk.......",
              "......rrrrBOk..........kOBBOrrrr....",
              ".....rrrrrrk............kkkrrrrrr...",
              "......rrrr..................rrrr....",
              "..................tt................",
              "...............kkkkkk...............",
              "...............kwwwwk...............",
              "...............kRRRRk...............",
              "................kRRk................",
              "gG...............kk...............gG",
              "og................................og",
              "o.................................o."
            ]
          },
          b_face_hit: {
            x: 14,
            y: 31,
            r: [
              ".......k....k..........k....k.......",
              "........k..k............k..k........",
              ".........kk..............kk.........",
              ".........kk..............kk.........",
              "........k..k............k..k........",
              "......rrrr..k..........k....rrrr....",
              ".....rrrrrr................rrrrrr...",
              "......rrrr..................rrrr....",
              "..................tt................",
              "................kkkk................",
              "...............k....k...............",
              "................kkkk................",
              "....................................",
              "gG................................gG",
              "og................................og",
              "o.................................o."
            ]
          },
          b_face_cheer: {
            x: 14,
            y: 34,
            r: [
              "........kkkk............kkkk........",
              ".......kk..kk..........kk..kk.......",
              "......rrrr..k..........k....rrrr....",
              ".....rrrrrr................rrrrrr...",
              "......rrrr..................rrrr....",
              "..................tt................",
              "...............kkkkkk...............",
              "...............kwwwwk...............",
              "...............kRRRRk...............",
              "................kRRk................",
              "gG...............kk...............gG",
              "og................................og",
              "o.................................o."
            ]
          }
        },
        anims: {
          idle: {
            loop: true,
            frames: [
              {
                d: 360,
                l: "harp hairb:0,0 skirt torso:0,0 head:0,0 pin:0,0 face_smile:0,0 ear:0,0 aL_a:0,0 aR_a:0,0 "
              },
              {
                d: 240,
                l: "harp hairb:0,0 skirt torso:0,0 head:0,0 pin:0,0 face_smile:0,0 ear:0,0 aL_a:0,0 aR_a:0,0 "
              },
              {
                d: 360,
                l: "harp hairb:0,1 skirt torso:0,1 head:0,1 pin:0,1 face_smile:0,1 ear:0,1 aL_a:0,1 aR_a:0,1 "
              },
              {
                d: 240,
                l: "harp hairb:0,1 skirt torso:0,1 head:0,1 pin:0,1 face_smile:0,1 ear:0,1 aL_a:0,1 aR_a:0,1 "
              }
            ]
          },
          stand: {
            loop: true,
            frames: [
              {
                d: 360,
                l: "hairb:0,0 skirt  torso:0,0 head:0,0 pin:0,0 face_smile:0,0 ear:0,0 miniharp:0,0 aW_L:0,0 aW_R:0,0"
              },
              {
                d: 240,
                l: "hairb:0,0 skirt  torso:0,0 head:0,0 pin:0,0 face_smile:0,0 ear:0,0 miniharp:0,0 aW_L:0,0 aW_R:0,0"
              },
              {
                d: 360,
                l: "hairb:0,1 skirt  torso:0,1 head:0,1 pin:0,1 face_smile:0,1 ear:0,1 miniharp:0,1 aW_L:0,1 aW_R:0,1"
              },
              {
                d: 240,
                l: "hairb:0,1 skirt  torso:0,1 head:0,1 pin:0,1 face_smile:0,1 ear:0,1 miniharp:0,1 aW_L:0,1 aW_R:0,1"
              }
            ]
          },
          perform: {
            loop: true,
            frames: [
              {
                d: 110,
                l: "harp hairb:0,0 skirt torso:0,0 head:0,0 pin:0,0 face_play:0,0 ear:0,0 aL_a aR_b gl_a +fx/note_a_w:6,18"
              },
              {
                d: 110,
                l: "harp hairb:0,1 skirt torso:0,1 head:0,1 pin:0,1 face_play:0,1 ear:0,1 aL_b aR_c gl_b +fx/note_b_w:5,12 +fx/twk_s_g:4,20"
              },
              {
                d: 110,
                l: "harp hairb:0,0 skirt torso:0,0 head:0,0 pin:0,0 face_play:0,0 ear:0,0 aL_c aR_d gl_c +fx/note_c_w:8,6"
              },
              {
                d: 110,
                l: "harp hairb:0,1 skirt torso:0,1 head:0,1 pin:0,1 face_play:0,1 ear:0,1 aL_d aR_a gl_d +fx/note_a_w:6,2 +fx/twk_s_g:9,14"
              },
              {
                d: 110,
                l: "harp hairb:0,0 skirt torso:0,0 head:0,0 pin:0,0 face_smile:0,0 ear:0,0 aL_b aR_c gl_e +fx/note_b_w:9,16"
              },
              {
                d: 110,
                l: "harp hairb:0,1 skirt torso:0,1 head:0,1 pin:0,1 face_play:0,1 ear:0,1 aL_a aR_d gl_a gl_d +fx/note_c_w:5,9"
              }
            ]
          },
          walk: {
            loop: true,
            frames: [
              {
                d: 130,
                l: "hairb:0,0 skirt shoeA torso:0,0 head:0,0 pin:0,0 face_smile:0,0 ear:0,0 miniharp:0,0 aW_L:0,0 aW_R:0,0"
              },
              {
                d: 130,
                l: "hairb:0,-1 skirt  torso:0,-1 head:0,-1 pin:0,-1 face_smile:0,-1 ear:0,-1 miniharp:0,-1 aW_L:0,-1 aW_R:0,-1"
              },
              {
                d: 130,
                l: "hairb:0,0 skirt shoeB torso:0,0 head:0,0 pin:0,0 face_smile:0,0 ear:0,0 miniharp:0,0 aW_L:0,0 aW_R:0,0"
              },
              {
                d: 130,
                l: "hairb:0,-1 skirt  torso:0,-1 head:0,-1 pin:0,-1 face_smile:0,-1 ear:0,-1 miniharp:0,-1 aW_L:0,-1 aW_R:0,-1"
              }
            ]
          },
          hit: {
            loop: false,
            frames: [
              {
                d: 90,
                l: "harp hairb:-1,1 skirt torso:-1,1 head:-1,1 pin:-1,1 face_hit:-1,1 ear:-1,1 aH_L aH_R "
              },
              {
                d: 160,
                l: "harp hairb:-1,0 skirt torso:-1,0 head:-1,0 pin:-1,0 face_hit:-1,0 ear:-1,0 aL_a:-1,0 aR_a:-1,0 "
              }
            ]
          },
          cheer: {
            loop: true,
            frames: [
              {
                d: 120,
                l: "harp hairb:0,0 skirt torso:0,0 head:0,0 pin:0,0 face_cheer:0,0 ear:0,0 aL_up aR_up +fx/twk_s_g:26,4"
              },
              {
                d: 110,
                l: "harp hairb:0,-2 skirt torso:0,-2 head:0,-2 pin:0,-2 face_cheer:0,-2 ear:0,-2 aL_up aR_up +fx/twk_m_g:20,0"
              },
              {
                d: 120,
                l: "harp hairb:0,-3 skirt torso:0,-3 head:0,-3 pin:0,-3 face_cheer:0,-3 ear:0,-3 aL_up aR_up +fx/twk_m_g:14,0 +fx/twk_s_g:29,6"
              },
              {
                d: 110,
                l: "harp hairb:0,-1 skirt torso:0,-1 head:0,-1 pin:0,-1 face_cheer:0,-1 ear:0,-1 aL_up aR_up +fx/twk_s_g:30,9"
              }
            ]
          },
          bust: {
            loop: true,
            frames: [
              { d: 2200, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_smile:0,0 b_front:0,0" },
              { d: 110, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_blink:0,0 b_front:0,0" },
              { d: 1600, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_smile:0,1 b_front:0,1" },
              { d: 110, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_blink:0,1 b_front:0,1" }
            ],
            w: 64,
            h: 64,
            ax: 32,
            ay: 63
          },
          bust_sing: {
            loop: true,
            frames: [
              { d: 400, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_sing:0,0 b_front:0,0" },
              { d: 400, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_sing:0,1 b_front:0,1" }
            ],
            w: 64,
            h: 64,
            ax: 32,
            ay: 63
          },
          bust_hit: {
            loop: true,
            frames: [
              { d: 400, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_hit:0,0 b_front:0,0" },
              { d: 400, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_hit:0,1 b_front:0,1" }
            ],
            w: 64,
            h: 64,
            ax: 32,
            ay: 63
          },
          bust_cheer: {
            loop: true,
            frames: [
              { d: 400, l: "b_back:0,0 b_torso:0,0 b_head:0,0 b_face_cheer:0,0 b_front:0,0" },
              { d: 400, l: "b_back:0,1 b_torso:0,1 b_head:0,1 b_face_cheer:0,1 b_front:0,1" }
            ],
            w: 64,
            h: 64,
            ax: 32,
            ay: 63
          }
        },
        label: "하피스트"
      },
      zombie: {
        kind: "undead",
        w: 32,
        h: 32,
        ax: 16,
        ay: 31,
        pieces: {
          head: {
            x: 7,
            y: 3,
            r: [
              ".....j.jj.j.......",
              ".....ejjjjeee.....",
              "...eeefffffffjj.j.",
              "..eefffffffffffh..",
              "..effffffffffffh..",
              ".eeffffffffffffhh.",
              ".efffffffffffffhh.",
              "eefffffffffffffhhh",
              "feffffffffffffhhhh",
              "feffffffffffffhhhh",
              "..fffffffffffhhh..",
              "..effffffffhhhhh..",
              "...hhhffhhhhhhh...",
              ".....hhhhhhhh.....",
              "........hh........"
            ]
          },
          face_waiting: {
            x: 10,
            y: 9,
            r: ["hhh......hhh", "wew......wew", "www......www", "............", "............", "...jjjjjj..."]
          },
          face_angry: {
            x: 10,
            y: 8,
            r: [
              "jj..........jj",
              ".jj........jj.",
              "RRR......RRR..",
              "RwR......RwR..",
              "..............",
              "..............",
              "...jjjjjj.....",
              "...j....j....."
            ]
          },
          face_leaving: {
            x: 10,
            y: 9,
            r: ["TTT......TTT", "TwT......TwT", "TTT......TTT", "............", "...j....j...", "....jjjj...."]
          },
          face_satisfied: {
            x: 9,
            y: 9,
            r: [
              "..j........j..",
              ".j.j......j.j.",
              "..............",
              "rr..........rr",
              "rr..j....j..rr",
              ".....jjjj....."
            ]
          },
          face_hit: {
            x: 10,
            y: 9,
            r: ["j.j......j.j", ".j........j.", "j.j......j.j", "............", "............", ".....kk.....", ".....kk....."]
          },
          face_restored: {
            x: 9,
            y: 9,
            r: [
              "..kk......kk..",
              "..wk......wk..",
              "..kn......kn..",
              "rr..........rr",
              "rr...kkkk...rr",
              ".....kRRk.....",
              "......kk......"
            ]
          },
          over_leaving: {
            x: 14,
            y: 0,
            r: ["..a..", ".aaa.", "aaaaa", "..a..", "..a.."]
          },
          over_satisfied: {
            x: 25,
            y: 2,
            r: [".G.", "GwG", ".G."]
          },
          over_angry: {
            x: 24,
            y: 3,
            r: ["R.R", ".R.", "R.R"]
          },
          torso: {
            x: 11,
            y: 18,
            r: ["BOOiiiiOOk", "BOOOiiOOOk", "BOOOOOOOOk", "BOOOaOOOOk", "BOOOOOOOOk", "BOOOOOOOOk", "BOOOOOOOOk", "BOOOOOOOOk", "OBOBOBOBOk"]
          },
          armL_0: {
            x: 4,
            y: 19,
            r: ["......eeeh", "....eeffhh", "fffefhhhh.", "eeehhh....", "eeeh......", "fff......."],
            ol: "j"
          },
          armR_0: {
            x: 18,
            y: 19,
            r: ["heee......", "hhffee....", ".hhhhfefff", "....hhheee", "......heee", ".......fff"],
            ol: "j"
          },
          armL_1: {
            x: 3,
            y: 18,
            r: ["..f........", ".eeeeeeeeeh", "feeefffhhhh", ".eeehhhh...", "..f........"],
            ol: "j"
          },
          armR_1: {
            x: 18,
            y: 18,
            r: ["........f..", "heeeeeeeee.", "hhhhfffeeef", "...hhhheee.", "........f.."],
            ol: "j"
          },
          armL_up: {
            x: 5,
            y: 12,
            r: ["fff......", "eee......", "eeee.....", "ffffe....", "..effe...", "...effe..", "....effe.", ".....effh", "......hhh"],
            ol: "j"
          },
          armR_up: {
            x: 18,
            y: 12,
            r: ["......fff", "......eee", ".....eeee", "....effff", "...effe..", "..effe...", ".effe....", "hffe.....", "hhh......"],
            ol: "j"
          },
          armL_hit: {
            x: 5,
            y: 14,
            r: ["..f......", ".eee.....", "feeef....", ".eeefe...", "..feffee.", "....hfffh", "......hhh"],
            ol: "j"
          },
          armR_hit: {
            x: 18,
            y: 14,
            r: ["......f..", ".....eee.", "....feeef", "...efeee.", ".eeffef..", "hfffh....", "hhh......"],
            ol: "j"
          },
          legs_0: {
            x: 11,
            y: 27,
            r: [".mdn..mdn.", ".ddn..ddn.", ".ddn..ddn.", "dnnnndnnnn"]
          },
          legs_a: {
            x: 10,
            y: 27,
            r: [".mdn...mdn.", ".ddn...ddn.", ".ddn..dnnnn", "dnnnn......"]
          },
          legs_b: {
            x: 11,
            y: 27,
            r: [".mdn...mdn.", ".ddn...ddn.", "dnnnn..ddn.", "......dnnnn"]
          },
          legs_p: {
            x: 11,
            y: 27,
            r: [".mdn..mdn.", ".ddn..ddn.", "dnnnndnnnn"]
          },
          b_head: {
            x: 4,
            y: 0,
            r: [
              "....................j.jj.jj.j...........................",
              ".....................jj.jj.jj...........................",
              ".........................eeeeee.........................",
              "....................eeeeeeeeeeeeeeee....................",
              ".................eeeeeeeeeeffffffeeeeee.................",
              "................eeeeeeffffffffffffffffee................",
              "..............eeeeefffffjjfjjffffffffffffe..............",
              ".............eeeeeffffffffffffffffffffffffe.............",
              "...........eeeeeffffffffffffffffffffffffffffe...........",
              "..........eeeeefffffffffffffffffffffffffffffhe..........",
              "..........eeeffffffffffffffffffffffffffffffffh..........",
              ".........eeefffffffffffffffffffffffffffffffffhh.........",
              "........eeeeffffffffffffffffffffffffffffffffffhh........",
              "........eeefffffffffffffffffffffffffffffffffffhh........",
              ".......eeeffffffffffffffffffffffffffffffjfjfffhhh.......",
              ".......eeefffffffffffffffffffffffffffffffjffffhhh.......",
              "......eeefffffffffffffffffffffffffffffffjfjffffhhh......",
              "..fff.eeeffffffffffffffffffffffffffffffffjfffffhhh.fff..",
              ".fffffeefffffffffffffffffffffffffffffffffffffffhhhfffff.",
              "ffffffeeffffffffffffffffffffffffffffffffffffffhhhhffffff",
              "ffffffeeffffffffffffffffffffffffffffffffffffffhhhhffffff",
              "ffffffeeffffffffffffffffffffffffffffffffffffffhhhhffffff",
              "ffffffefffffffffffffffffffffffffffffffffffffffhhhhffffff",
              ".fffffeffffffffffffffffffffffffffffffffffffffhhhhhfffff.",
              ".ffff.effffffffffffffffffffffffffffffffffffffhhhhh.ffff.",
              "..ff..eefffffffffffffffffffffffffffffffffffffhhhhh..ff..",
              "......eeffffffffffffffffffffffffffffffffffffhhhhhh......",
              ".......efffffffffffffffffffffffffffffffffffhhhhhh.......",
              ".......efffffffffffffffffffffffffffffffffffhhhhhh.......",
              ".......eefffffffffffffffffffffffffffffffffhhhhhhh.......",
              "........effffffffffffffffffffffffffffffffhhhhhhh........",
              ".........fffffffffffffffffffffffffffffffhhhhhhh.........",
              ".........effffffffffffffffffffffffffffhhhhhhhhh.........",
              "..........effffffffffffffffffffffffffhhhhhhhhh..........",
              "...........hhffffffffffffffffffffffhhhhhhhhhh...........",
              "............hhhhffffffffffffffffhhhhhhhhhhhh............",
              "..............hhhhhhffffffffhhhhhhhhhhhhhh..............",
              "...............hhhhhhhhhhhhhhhhhhhhhhhhhh...............",
              ".................hhhhhhhhhhhhhhhhhhhhhh.................",
              "....................hhhhhhhhhhhhhhhh....................",
              "........................hhhhhhhh........................"
            ],
            ol: "j"
          },
          b_torso: {
            x: 0,
            y: 43,
            r: [
              "............BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB............",
              "...........BBOOOOOOOOOOOiiiiiiiiiiiiiiiiOOOOOOOOOOkkk...........",
              "...........BOOOOOOOOOOOOOiiiiiiiiiiiiiiOOOOOOOOOOOOkk...........",
              "..........BBOOOOOOOOOOOOOiiiiiiiiiiiiiiOOOOOOOOOOOOkkk..........",
              "..........BOOOOOOOOOOOOOOOiiiiiiiiiiiiOOOOOOOOOOOOOOkk..........",
              ".........BBOOOOOOOOOOOOOOOOiiiiiiiiiiOOOOOOOOOOOOOOOkkk.........",
              ".........BOOOOOOOOOOOOOOOOOiiiiiiiiiiOOOOOOOOOOOOOOOOkk.........",
              "........BBOOOOOOOOOOOOOOOOOOiiiiiiiiOOOOOOOOOOOOOOOOOkkk........",
              "........BOOOOOOOOOOOOOOOOOOOiiiiiiiiOOOOOOOOOOOOOOOOOkkk........",
              ".......BBOOOOOOOOOOOOOOOOOOOOiiiiiiOOOOOOOOOOOOOOOOOOOkkk.......",
              ".......BOOOOOOOOOOOOOOOOOOOOOiiiiiiOOOOOOOOOOOOOOOOOOOkkk.......",
              "..ffffffffOOOOOOOOOOOOOOOOOOOOiiiiOOOOOOOOOOOOOOOOOOOOffffffff..",
              ".ffeeeeffffOOOOOOOOOOOOOOOOOOOOaaOOOOOOOOOOOOOOOOOOOOffeeeeffff.",
              "ffeeeeeeffffOOOOOOOOOOOOOOOOOOOaaOOOOOOOOOOOOOOOOOOOffeeeeeeffff",
              "ffeeeeeeffffOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOffeeeeeeffff",
              "fffeeeefffffOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOfffeeeefffff",
              "ffffffffffffOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOffffffffffff",
              ".ffffffffffOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOffffffffff.",
              "..ffffffffkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkffffffff..",
              "...Bkkkkjkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk...",
              "..BBkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk.."
            ],
            ol: "k"
          },
          b_face_waiting: {
            x: 16,
            y: 23,
            r: [
              "jjjjjjjjjj...........jjjjjjjjjj",
              "hhhhhhhhhh...........hhhhhhhhhh",
              "hhhhhhhhhh...........hhhhhhhhhh",
              "hhhhhhhhhh...........hhhhhhhhhh",
              ".wwweeeww.............wwweeeww.",
              "wwweweeeww...........wwweweeeww",
              "wwweeeeeww...........wwweeeeeww",
              ".wweeeeew.............wweeeeew.",
              ".wwweeeww.............wwweeeww.",
              "..wwwwww...............wwwwww..",
              "....ww...................ww....",
              "...............................",
              "...............................",
              "...............................",
              "...............................",
              "...............................",
              "...............................",
              "........jjjjjjjjjjjjjjjj.......",
              ".......jjjjjjjjjjjjjjjjj.......",
              ".......j......................."
            ]
          },
          b_face_angry: {
            x: 14,
            y: 22,
            r: [
              "j..................................j",
              "jjj..............................jjj",
              "jjjjjjjjjjjj...........jjjjjjjjjjjjj",
              "jjjjjjjhhhhh...........hhhhhhjjjjjjj",
              ".jjjjjjjjhhh...........hhhhjjjjjjj..",
              "..hhjjjjjjjh...........hhjjjjjjhh...",
              "...wwwRjjjjj............jjjjRRww....",
              "..wwwRwRRRjj...........wjwRwRRRww...",
              "..wwwRRRRRww...........wwwRRRRRww...",
              "...wwRRRRRw.............wwRRRRRw....",
              "...wwwRRRww.............wwwRRRww....",
              "....wwwwww...............wwwwww.....",
              "......ww...................ww.......",
              "....................................",
              "....................................",
              "....................................",
              "....................................",
              "............jjjjjjjjjjjj............",
              "............j..........j............"
            ]
          },
          b_face_leaving: {
            x: 16,
            y: 23,
            r: [
              "jjjjjjjjjj...........jjjjjjjjjj",
              "hhhhhhhhhh...........hhhhhhhhhh",
              "hhhhhhhhhh...........hhhhhhhhhh",
              "hhhhhhhhhh...........hhhhhhhhhh",
              ".wwwTTTww.............wwwTTTww.",
              "wwwTwTTTww...........wwwTwTTTww",
              "wwwTTTTTww...........wwwTTTTTww",
              ".wwTTTTTw.............wwTTTTTw.",
              ".wwwTTTww.............wwwTTTww.",
              "..wwwwww...............wwwwww..",
              "....ww...................ww....",
              "...............................",
              "...............................",
              "...............................",
              "...............................",
              "..........j..........j.........",
              "...........jjjjjjjjjj.........."
            ]
          },
          b_face_satisfied: {
            x: 14,
            y: 27,
            r: [
              "......jjjj.................jjjj.......",
              ".....j....j...............j....j......",
              "....j......j.............j......j.....",
              "......................................",
              "......................................",
              "......................................",
              "......................................",
              "......................................",
              "......................................",
              "rrrrrr..........................rrrrrr",
              "rrrrrr..........................rrrrrr",
              "rrrrrr......j..........j........rrrrrr",
              ".............jjjjjjjjjj..............."
            ]
          },
          b_face_hit: {
            x: 18,
            y: 26,
            r: [
              "j....j...............j....j",
              ".j..j.................j..j.",
              "..jj...................jj..",
              "..jj...................jj..",
              ".j..j.................j..j.",
              "j....j...............j....j",
              "...........................",
              "...........................",
              "...........................",
              "...........................",
              "...........................",
              "...........................",
              "...........................",
              "............kkkk...........",
              "............kRRk...........",
              "............kkkk..........."
            ]
          },
          b_face_restored: {
            x: 14,
            y: 25,
            r: [
              "....kkkk.................kkkk.........",
              "...kwwkkk...............kwwkkk........",
              "...kwwkkk...............kwwkkk........",
              "...kkkkkk...............kkkkkk........",
              "...kOOOOk...............kOOOOk........",
              "...kOBBOk...............kOBBOk........",
              "....kkkk.................kkkk.........",
              "......................................",
              "......................................",
              "......................................",
              "rrrrrr..........................rrrrrr",
              "rrrrrr..........................rrrrrr",
              "rrrrrr..........................rrrrrr",
              "..............kkkkkkkk................",
              "..............kwwwwwwk................",
              "..............kRRRRRRk................",
              "...............kRRRRk.................",
              "................kkkk.................."
            ]
          },
          b_over_leaving: {
            x: 29,
            y: 0,
            r: ["...a...", "..aaa..", ".aaaaa.", "aaaaaaa", "...a...", "...a...", "...a..."]
          },
          b_over_satisfied: {
            x: 54,
            y: 4,
            r: ["..G..", "..G..", "GGwGG", "..G..", "..G.."]
          },
          b_over_angry: {
            x: 54,
            y: 6,
            r: ["R...R", ".R.R.", "..R..", ".R.R.", "R...R"]
          }
        },
        anims: {
          idle: {
            loop: true,
            frames: [
              { d: 420, l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0" },
              { d: 420, l: "legs_0:0,0 torso:0,0 armL_1:0,0 armR_1:0,0 head:0,1 ~face:0,1 +~over:0,1" }
            ]
          },
          walk: {
            loop: true,
            frames: [
              { d: 140, l: "legs_a:0,0 torso:0,0 armL_1:0,0 armR_1:0,0 head:0,0 ~face:0,0 +~over:0,0" },
              {
                d: 140,
                l: "legs_p:0,0 torso:0,-1 armL_0:0,-1 armR_0:0,-1 head:0,-1 ~face:0,-1 +~over:0,-1"
              },
              { d: 140, l: "legs_b:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0" },
              {
                d: 140,
                l: "legs_p:0,0 torso:0,-1 armL_0:0,-1 armR_0:0,-1 head:0,-1 ~face:0,-1 +~over:0,-1"
              }
            ]
          },
          attack: {
            loop: false,
            frames: [
              { d: 110, l: "legs_0:1,0 torso:1,0 armL_1:1,0 armR_1:1,0 head:1,1 face_angry:1,1" },
              { d: 90, l: "legs_a:-2,0 torso:-2,1 armL_up:-2,1 armR_up:-2,1 head:-2,1 face_angry:-2,1" },
              {
                d: 140,
                l: "legs_p:-1,0 torso:-1,0 armL_up:-1,0 armR_up:-1,0 head:-1,0 face_angry:-1,0"
              }
            ]
          },
          hit: {
            loop: false,
            frames: [
              { d: 200, l: "legs_0:1,0 torso:1,0 armL_hit:1,0 armR_hit:1,0 head:1,0 face_hit:1,0" }
            ]
          },
          mood: {
            loop: true,
            frames: [
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "waiting"
              },
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "angry"
              },
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "leaving"
              },
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "satisfied"
              }
            ]
          },
          restore: {
            loop: false,
            frames: [
              {
                d: 200,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,1 face_waiting:0,1",
                g: 1
              },
              {
                d: 150,
                l: "-tile/beam legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,1 face_waiting:0,1",
                g: 1
              },
              {
                d: 150,
                l: "-tile/beam legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 face_waiting:0,0",
                g: 0.75,
                h: 0.25
              },
              {
                d: 150,
                l: "-tile/beam legs_0:0,0 torso:0,-1 armL_1:0,-1 armR_1:0,-1 head:0,-1 face_leaving:0,-1 +fx/twk_s_g:3,6 +fx/twk_s_g:26,9",
                g: 0.45,
                m: 0.25,
                h: 0.5
              },
              {
                d: 110,
                l: "legs_0:0,0 torso:0,-2 armL_up:0,-2 armR_up:0,-2 head:0,-2 face_restored:0,-2 +fx/twk_m_g:2,4 +fx/twk_m_g:27,7 +fx/twk_s_g:14,1",
                g: 0.15,
                m: 0.6,
                h: 0.8,
                f: 0.55
              },
              {
                d: 110,
                l: "legs_0:0,0 torso:0,-3 armL_up:0,-3 armR_up:0,-3 head:0,-3 face_restored:0,-3 +fx/twk_l_g:2,5 +fx/twk_s_g:27,4 +fx/twk_s_g:8,1",
                g: 0,
                m: 1,
                h: 0.5,
                f: 0.2
              },
              {
                d: 120,
                l: "legs_0:0,0 torso:0,-1 armL_up:0,-1 armR_up:0,-1 head:0,-1 face_restored:0,-1 +fx/twk_s_g:3,8 +fx/twk_m_g:26,6",
                g: 0,
                m: 1,
                h: 0.25
              },
              {
                d: 260,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 face_restored:0,0 +fx/heart:24,3",
                g: 0,
                m: 1,
                h: 0
              }
            ]
          },
          audience: {
            loop: true,
            frames: [
              {
                d: 300,
                l: "torso:0,4 armL_0:0,4 armR_0:0,4 head:0,4 face_restored:0,4 tile/seat_front",
                m: 1
              },
              {
                d: 260,
                l: "torso:0,4 armL_up:0,4 armR_0:0,4 head:0,3 face_restored:0,3 tile/seat_front +fx/twk_s_g:3,8",
                m: 1
              },
              {
                d: 260,
                l: "torso:0,3 armL_up:0,3 armR_up:0,3 head:0,3 face_restored:0,3 tile/seat_front",
                m: 1
              },
              {
                d: 260,
                l: "torso:0,4 armL_0:0,4 armR_up:0,4 head:0,3 face_restored:0,3 tile/seat_front +fx/twk_s_g:27,8",
                m: 1
              }
            ]
          },
          bust: {
            loop: true,
            w: 64,
            h: 64,
            ax: 32,
            ay: 63,
            frames: [
              { d: 700, l: "b_torso:0,0 b_head:0,0 ~b_face:0,0 +~b_over:0,0" },
              { d: 700, l: "b_torso:0,1 b_head:0,1 ~b_face:0,1 +~b_over:0,1" }
            ]
          }
        },
        label: "좀비",
        pal2: { e: "s", f: "t", h: "u", j: "O", O: "P", B: "p", b: "C", a: "g", n: "q", d: "A", m: "C" }
      },
      skeleton: {
        kind: "undead",
        w: 32,
        h: 32,
        ax: 16,
        ay: 31,
        pieces: {
          head: {
            x: 8,
            y: 4,
            r: [
              "....wwwwwwww....",
              "..wwwiiiiiiiiwy.",
              ".wwiiiiiiiiiiiy.",
              ".yiiiiiiiiiiiiy.",
              "wwiiiiiiiiiiiiyy",
              "wiiiiiiiiiiiiiyy",
              "wiiiiiiiiiiiiiyy",
              "wiiiiiiiiiiiiyyy",
              "wiiiiiiyyiiiiyyy",
              ".iiiiiiiiiiiyyy.",
              ".wiiiiiiiiyyyyy.",
              "..yyyiiyyyyyyy..",
              "....yyyyyyyy....",
              ".......yy......."
            ]
          },
          face_waiting: {
            x: 10,
            y: 9,
            r: ["nnn......nnn", "ndn......ndn", "nnn......nnn", "............", "............", "..wwwwwwww..", "..ywywywyw.."]
          },
          face_angry: {
            x: 9,
            y: 7,
            r: [
              "yy............yy",
              ".yy..........yy.",
              ".nnn......nnn...",
              ".nRn......nRn...",
              ".nnn......nnn...",
              "................",
              "................",
              "...wywywywy.....",
              "....y.y.y.y....."
            ]
          },
          face_leaving: {
            x: 10,
            y: 9,
            r: ["nnn......nnn", "nTn......nTn", "nnn......nnn", "............", "............", "..y......y..", "...wwwwww..."]
          },
          face_satisfied: {
            x: 9,
            y: 10,
            r: [
              "..n........n..",
              ".n.n......n.n.",
              "rr..........rr",
              "rr..........rr",
              "...y......y...",
              "....wwwwww...."
            ]
          },
          face_hit: {
            x: 10,
            y: 9,
            r: ["n.n......n.n", ".n........n.", "n.n......n.n", "............", "............", "....nnnn....", "....nkkn...."]
          },
          face_restored: {
            x: 9,
            y: 9,
            r: [
              "..kk......kk..",
              "..wk......wk..",
              "..kn......kn..",
              "rr..........rr",
              "rr...kkkk...rr",
              ".....kRRk.....",
              "......kk......"
            ]
          },
          over_leaving: {
            x: 14,
            y: 0,
            r: ["..a..", ".aaa.", "aaaaa", "..a..", "..a.."]
          },
          over_satisfied: {
            x: 25,
            y: 2,
            r: [".G.", "GwG", ".G."]
          },
          over_angry: {
            x: 24,
            y: 3,
            r: ["R.R", ".R.", "R.R"]
          },
          torso: {
            x: 12,
            y: 18,
            r: ["BOiiiiOk", "BOiyyiOk", "BOiiiiOk", "BOiyyiOk", "BOOOOOOk", "BOOOOOOk", "BOOOOOOk", "BOOOOOOk", "OBOBOBOk"]
          },
          armL_0: {
            x: 4,
            y: 19,
            r: ["........wy", ".....wwyyy", ".w.wyyyy..", "wwwyy.....", "wiw.......", ".w........"],
            ol: "O"
          },
          armR_0: {
            x: 18,
            y: 19,
            r: ["yw........", "yyyww.....", "..yyyyw.w.", ".....yywww", ".......wiw", "........w."],
            ol: "O"
          },
          armL_1: {
            x: 4,
            y: 19,
            r: ["wwwwwwwwwy", "wiwyyyyyyy", "www......."],
            ol: "O"
          },
          armR_1: {
            x: 18,
            y: 19,
            r: ["ywwwwwwwww", "yyyyyyywiw", ".......www"],
            ol: "O"
          },
          armL_up: {
            x: 5,
            y: 12,
            r: [".w.......", "www......", "wiww.....", ".wwiw....", "...wiw...", "....wiw..", ".....wiw.", "......wiy", ".......yy"],
            ol: "O"
          },
          armR_up: {
            x: 18,
            y: 12,
            r: [".......w.", "......www", ".....wwiw", "....wiww.", "...wiw...", "..wiw....", ".wiw.....", "yiw......", "yy......."],
            ol: "O"
          },
          armL_hit: {
            x: 6,
            y: 15,
            r: ["www.....", "wiw.....", "wwwww...", "...wiw..", "....yiwy", "......yy"],
            ol: "O"
          },
          armR_hit: {
            x: 18,
            y: 15,
            r: [".....www", ".....wiw", "...wwwww", "..wiw...", "ywiy....", "yy......"],
            ol: "O"
          },
          legs_0: {
            x: 12,
            y: 27,
            r: [".wi..wi.", ".wi..wi.", ".wi..wi.", "wiiiwiii"]
          },
          legs_a: {
            x: 11,
            y: 27,
            r: [".wi...wi.", ".wi...wi.", ".wi..wiii", "wiii....."]
          },
          legs_b: {
            x: 12,
            y: 27,
            r: [".wi...wi.", ".wi...wi.", "wiii..wi.", ".....wiii"]
          },
          legs_p: {
            x: 12,
            y: 27,
            r: [".wi..wi.", ".wi..wi.", "wiiiwiii"]
          },
          b_head: {
            x: 9,
            y: 2,
            r: [
              "....................wwwwww....................",
              "...............wwwwwwwwwwwwwwww...............",
              "............wwwwwwwwwwiiiiiiwwwwww............",
              "...........wwwwwwiiiiiiiiiiiiiiiiww...........",
              ".........wwwwwiiiiiiiiiiiiiiiiiiiiiiw.........",
              "........wwwwwiiiiiiiiiiiiiiiiiiiiiiiiw........",
              "......wwwwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiyy.....",
              ".....wwwwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyy....",
              ".....wwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiy.....",
              "....wwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyy....",
              "...wwwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyy...",
              "...wwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyy...",
              "..wwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyy..",
              "..wwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyy..",
              ".wwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyy.",
              ".wwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyy.",
              ".ywyiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyy.",
              ".wyiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyy.",
              "wwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyy",
              "wwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyy",
              "wwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyy",
              ".wiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyy.",
              ".wiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyy.",
              ".wwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyy.",
              ".wwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyyy.",
              "..wiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyyy..",
              "..wiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyyy..",
              "..wwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyyyy..",
              "...wiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyyyy...",
              "....iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyyyy....",
              "....wiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyyyyyy....",
              ".....wiiiiiiiiiiiiiiiiyyiiiiiiiiyyyyyyyyy.....",
              "......yyiiiiiiiiiiiiiiyyiiiiiiyyyyyyyyyy......",
              ".......yyyyiiiiiiiiiiiiiiiiyyyyyyyyyyyy.......",
              ".........yyyyyyiiiiiiiiyyyyyyyyyyyyyy.........",
              "..........yyyyyyyyyyyyyyyyyyyyyyyyyy..........",
              "............yyyyyyyyyyyyyyyyyyyyyy............",
              "...............yyyyyyyyyyyyyyyy...............",
              "...................yyyyyyyy..................."
            ],
            ol: "O"
          },
          b_torso: {
            x: 1,
            y: 43,
            r: [
              "...........BBBBBBBBBBBBBBBBiiiyyiiiBBBBBBBBBBBBBBBB...........",
              "..........BBOOOOOOOOOOOOOOOiiiyyiiiOOOOOOOOOOOOOOkkk..........",
              "..........BOOOOOOOOOOOOOOOOyyyyyyyyOOOOOOOOOOOOOOkkk..........",
              "..........BOOOOOOOOOOOOOOOOiiiyyiiiOOOOOOOOOOOOOOkkk..........",
              ".........BBOOOOOOOOOOOOOOOOiiiyyiiiOOOOOOOOOOOOOOOkkk.........",
              ".........BOOOOOOOOOOOOOOOOOyyyyyyyyOOOOOOOOOOOOOOOkkk.........",
              ".........BOOOOOOOOOOOOOOOOOiiiyyiiiOOOOOOOOOOOOOOOOkk.........",
              "........BBOOOOOOOOOOOOOOOOOiiiyyiiiOOOOOOOOOOOOOOOOkkk........",
              "........BOOOOOOOOOOOOOOOOOOyyyyyyyyOOOOOOOOOOOOOOOOkkk........",
              ".......BBOOOOOOOOOOOOOOOOOOiiiyyiiiOOOOOOOOOOOOOOOOOkkk.......",
              ".......BOOOOOOOOOOOOOOOOOOOiiiyyiiiOOOOOOOOOOOOOOOOOkkk.......",
              ".......BOOOOOOOOOOOOOOOOOOOyyyyyyyyOOOOOOOOOOOOOOOOOOkk.......",
              "......BBOOOOOOOOOOOOOOOOOOOiiiyyiiiOOOOOOOOOOOOOOOOOOkkk......",
              "......BOOOOOOOOOOOOOOOOOOOOiiiyyiiiOOOOOOOOOOOOOOOOOOkkk......",
              "..wwwwwwOOOOOOOOOOOOOOOOOOOyyyyyyyyOOOOOOOOOOOOOOOOOOOwwwwww..",
              "wwwwwwwwwwOOOOOOOOOOOOOOOOOiiiyyiiiOOOOOOOOOOOOOOOOOwwwwwwwwww",
              "wwwwwwwwwwOOOOOOOOOOOOOOOOOiiiyyiiiOOOOOOOOOOOOOOOOOwwwwwwwwww",
              "wwwwwwwwwwOOOOOOOOOOOOOOOOOyyyyyyyyOOOOOOOOOOOOOOOOOwwwwwwwwww",
              "wwwwwwwwwwkkkkkkkkkkkkkkkkkiiiyyiiikkkkkkkkkkkkkkkkkwwwwwwwwww",
              "..wwwwwwkkkkkkkkkkkkkkkkkkkiiiyyiiikkkkkkkkkkkkkkkkkkkwwwwww..",
              "...BBkkkkkkkkkkkkkkkkkkkkkkyyyyyyyykkkkkkkkkkkkkkkkkkkkkkkk..."
            ],
            ol: "k"
          },
          b_face_waiting: {
            x: 13,
            y: 21,
            r: [
              "....nnnn....................nnnn....",
              "..nnnnnnnn................nnnnnnnn..",
              ".nnnnnnnnnn..............nnnnnnnnnn.",
              ".nnnnnnnnnn..............nnnnnnnnnn.",
              ".nnndnnnnnn..............nnndnnnnnn.",
              "nnnnndddnnnn............nnnnndddnnnn",
              "nnnndddddnnn............nnnndddddnnn",
              ".nnndddddnn..............nnndddddnn.",
              ".nnndddddnn..............nnndddddnn.",
              ".nnnndddnnn..............nnnndddnnn.",
              "..nnnnnnnn................nnnnnnnn..",
              "....nnnn....................nnnn....",
              "....................................",
              "....................................",
              "....................................",
              "....................................",
              "....................................",
              "....................................",
              "....................................",
              "....................................",
              "....................................",
              ".......wwwwwwwwwwwwwwwwwwwwwwww.....",
              ".......iyiiyiiyiiyiiyiiyiiyiiyi.....",
              ".......iyiiyiiyiiyiiyiiyiiyiiyi.....",
              ".......yyyyyyyyyyyyyyyyyyyyyyyy.....",
              ".......iyiiyiiyiiyiiyiiyiiyiiyi.....",
              ".......iyiiyiiyiiyiiyiiyiiyiiyi.....",
              ".......iyiiyiiyiiyiiyiiyiiyiiyi....."
            ]
          },
          b_face_angry: {
            x: 12,
            y: 20,
            r: [
              "y......................................y",
              "yyy..................................yyy",
              "yyyyynnnn....................nnnn..yyyyy",
              "yyyyyyynnnn................nnnnnnyyyyyyy",
              ".yyyyyyyynnn..............nnnnnyyyyyyyy.",
              "..nnyyyyyyyn..............nnnyyyyyyy....",
              "..nnndnyyyyyy.............nyyyyyynnn....",
              ".nnnnnRRRnyyyy...........nyyyyRRRnnnn...",
              ".nnnnRRRRRnnny...........nynnRRRRRnnn...",
              "..nnnRRRRRnn..............nnnRRRRRnn....",
              "..nnnRRRRRnn..............nnnRRRRRnn....",
              "..nnnnRRRnnn..............nnnnRRRnnn....",
              "...nnnnnnnn................nnnnnnnn.....",
              ".....nnnn....................nnnn.......",
              "........................................",
              "........................................",
              "........................................",
              "........................................",
              "........................................",
              "........................................",
              "........................................",
              "........................................",
              "........wwwwwwwwwwwwwwwwwwwwwwww........",
              "........iyiiyiiyiiyiiyiiyiiyiiyi........",
              "........iyiiyiiyiiyiiyiiyiiyiiyi........",
              "........yyyyyyyyyyyyyyyyyyyyyyyy........",
              "........yyyiyiyyyiyiyyyiyiyyyiyi........",
              "........iyiiyiiyiiyiiyiiyiiyiiyi........",
              "........iyiiyiiyiiyiiyiiyiiyiiyi........"
            ]
          },
          b_face_leaving: {
            x: 13,
            y: 21,
            r: [
              "....nnnn....................nnnn....",
              "..nnnnnnnn................nnnnnnnn..",
              ".nnnnnnnnnn..............nnnnnnnnnn.",
              ".nnnnnnnnnn..............nnnnnnnnnn.",
              ".nnndnnnnnn..............nnndnnnnnn.",
              "nnnnnTTTnnnn............nnnnnTTTnnnn",
              "nnnnTTTTTnnn............nnnnTTTTTnnn",
              ".nnnTTTTTnn..............nnnTTTTTnn.",
              ".nnnTTTTTnn..............nnnTTTTTnn.",
              ".nnnnTTTnnn..............nnnnTTTnnn.",
              "..nnnnnnnn................nnnnnnnn..",
              "....nnnn....................nnnn....",
              "....................................",
              "....................................",
              "....................................",
              "....................................",
              "....................................",
              "....................................",
              "....................................",
              "....................................",
              ".............y........y.............",
              ".......wwwwwwwwwwwwwwwwwwwwwwww.....",
              ".......iyiiyiiyiiyiiyiiyiiyiiyi.....",
              ".......iyiiyiiyiiyiiyiiyiiyiiyi.....",
              ".......yyyyyyyyyyyyyyyyyyyyyyyy.....",
              ".......iyiiyiiyiiyiiyiiyiiyiiyi.....",
              ".......iyiiyiiyiiyiiyiiyiiyiiyi.....",
              ".......iyiiyiiyiiyiiyiiyiiyiiyi....."
            ]
          },
          b_face_satisfied: {
            x: 12,
            y: 28,
            r: [
              "......nnnn....................nnnn........",
              ".....n....n..................n....n.......",
              "....n......n................n......n......",
              "..........................................",
              "..........................................",
              "..........................................",
              "..........................................",
              "..........................................",
              "rrrrrr..............................rrrrrr",
              "rrrrrr..............................rrrrrr",
              "rrrrrr..............................rrrrrr",
              "..........................................",
              "..........................................",
              "..............y........y..................",
              "........wwwwwwwwwwwwwwwwwwwwwwww..........",
              "........iyiiyiiyiiyiiyiiyiiyiiyi..........",
              "........iyiiyiiyiiyiiyiiyiiyiiyi..........",
              "........yyyyyyyyyyyyyyyyyyyyyyyy..........",
              "........iyiiyiiyiiyiiyiiyiiyiiyi..........",
              "........iyiiyiiyiiyiiyiiyiiyiiyi..........",
              "........iyiiyiiyiiyiiyiiyiiyiiyi.........."
            ]
          },
          b_face_hit: {
            x: 18,
            y: 26,
            r: [
              "n....n..................n....n",
              ".n..n....................n..n.",
              "..nn......................nn..",
              "..nn......................nn..",
              ".n..n....................n..n.",
              "n....n..................n....n",
              "..............................",
              "..............................",
              "..............................",
              "..............................",
              "..............................",
              "..............................",
              "..............................",
              "..............................",
              "..............................",
              "..............................",
              "..wwwwwwwwwwwwwwwwwwwwwwww....",
              "..iyiiyiiyiiyiiyiiyiiyiiyi....",
              "..iyiiyiiyiiyiiyiiyiiyiiyi....",
              "..yyyyyyyyyyyyyyyyyyyyyyyy....",
              "..iyiiyiiyiiyiiyiiyiiyiiyi....",
              "..iyiiyiiyiiyiiyiiyiiyiiyi....",
              "..iyiiyiiyiiyiiyiiyiiyiiyi...."
            ]
          },
          b_face_restored: {
            x: 13,
            y: 25,
            r: [
              ".....kkkk.................kkkk..........",
              "....kwwkkk...............kwwkkk.........",
              "....kwwkkk...............kwwkkk.........",
              "....kkkkkk...............kkkkkk.........",
              "....kOOOOk...............kOOOOk.........",
              "....kOBBOk...............kOBBOk.........",
              ".....kkkk.................kkkk..........",
              "........................................",
              "........................................",
              "........................................",
              "rrrrrr............................rrrrrr",
              "rrrrrr............................rrrrrr",
              "rrrrrr............................rrrrrr",
              "...............kkkkkkkk.................",
              "...............kwwwwwwk.................",
              "...............kRRRRRRk.................",
              "................kRRRRk..................",
              ".................kkkk..................."
            ]
          },
          b_over_leaving: {
            x: 29,
            y: 0,
            r: ["...a...", "..aaa..", ".aaaaa.", "aaaaaaa", "...a...", "...a...", "...a..."]
          },
          b_over_satisfied: {
            x: 54,
            y: 4,
            r: ["..G..", "..G..", "GGwGG", "..G..", "..G.."]
          },
          b_over_angry: {
            x: 54,
            y: 6,
            r: ["R...R", ".R.R.", "..R..", ".R.R.", "R...R"]
          }
        },
        anims: {
          idle: {
            loop: true,
            frames: [
              { d: 420, l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0" },
              { d: 420, l: "legs_0:0,0 torso:0,0 armL_1:0,0 armR_1:0,0 head:0,1 ~face:0,1 +~over:0,1" }
            ]
          },
          walk: {
            loop: true,
            frames: [
              { d: 140, l: "legs_a:0,0 torso:0,0 armL_1:0,0 armR_1:0,0 head:0,0 ~face:0,0 +~over:0,0" },
              {
                d: 140,
                l: "legs_p:0,0 torso:0,-1 armL_0:0,-1 armR_0:0,-1 head:0,-1 ~face:0,-1 +~over:0,-1"
              },
              { d: 140, l: "legs_b:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0" },
              {
                d: 140,
                l: "legs_p:0,0 torso:0,-1 armL_0:0,-1 armR_0:0,-1 head:0,-1 ~face:0,-1 +~over:0,-1"
              }
            ]
          },
          attack: {
            loop: false,
            frames: [
              { d: 110, l: "legs_0:1,0 torso:1,0 armL_1:1,0 armR_1:1,0 head:1,1 face_angry:1,1" },
              { d: 90, l: "legs_a:-2,0 torso:-2,1 armL_up:-2,1 armR_up:-2,1 head:-2,1 face_angry:-2,1" },
              {
                d: 140,
                l: "legs_p:-1,0 torso:-1,0 armL_up:-1,0 armR_up:-1,0 head:-1,0 face_angry:-1,0"
              }
            ]
          },
          hit: {
            loop: false,
            frames: [
              { d: 200, l: "legs_0:1,0 torso:1,0 armL_hit:1,0 armR_hit:1,0 head:1,0 face_hit:1,0" }
            ]
          },
          mood: {
            loop: true,
            frames: [
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "waiting"
              },
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "angry"
              },
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "leaving"
              },
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "satisfied"
              }
            ]
          },
          restore: {
            loop: false,
            frames: [
              {
                d: 200,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,1 face_waiting:0,1",
                g: 1
              },
              {
                d: 150,
                l: "-tile/beam legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,1 face_waiting:0,1",
                g: 1
              },
              {
                d: 150,
                l: "-tile/beam legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 face_waiting:0,0",
                g: 0.75,
                h: 0.25
              },
              {
                d: 150,
                l: "-tile/beam legs_0:0,0 torso:0,-1 armL_1:0,-1 armR_1:0,-1 head:0,-1 face_leaving:0,-1 +fx/twk_s_g:3,6 +fx/twk_s_g:26,9",
                g: 0.45,
                m: 0.25,
                h: 0.5
              },
              {
                d: 110,
                l: "legs_0:0,0 torso:0,-2 armL_up:0,-2 armR_up:0,-2 head:0,-2 face_restored:0,-2 +fx/twk_m_g:2,4 +fx/twk_m_g:27,7 +fx/twk_s_g:14,1",
                g: 0.15,
                m: 0.6,
                h: 0.8,
                f: 0.55
              },
              {
                d: 110,
                l: "legs_0:0,0 torso:0,-3 armL_up:0,-3 armR_up:0,-3 head:0,-3 face_restored:0,-3 +fx/twk_l_g:2,5 +fx/twk_s_g:27,4 +fx/twk_s_g:8,1",
                g: 0,
                m: 1,
                h: 0.5,
                f: 0.2
              },
              {
                d: 120,
                l: "legs_0:0,0 torso:0,-1 armL_up:0,-1 armR_up:0,-1 head:0,-1 face_restored:0,-1 +fx/twk_s_g:3,8 +fx/twk_m_g:26,6",
                g: 0,
                m: 1,
                h: 0.25
              },
              {
                d: 260,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 face_restored:0,0 +fx/heart:24,3",
                g: 0,
                m: 1,
                h: 0
              }
            ]
          },
          audience: {
            loop: true,
            frames: [
              {
                d: 300,
                l: "torso:0,4 armL_0:0,4 armR_0:0,4 head:0,4 face_restored:0,4 tile/seat_front",
                m: 1
              },
              {
                d: 260,
                l: "torso:0,4 armL_up:0,4 armR_0:0,4 head:0,3 face_restored:0,3 tile/seat_front +fx/twk_s_g:3,8",
                m: 1
              },
              {
                d: 260,
                l: "torso:0,3 armL_up:0,3 armR_up:0,3 head:0,3 face_restored:0,3 tile/seat_front",
                m: 1
              },
              {
                d: 260,
                l: "torso:0,4 armL_0:0,4 armR_up:0,4 head:0,3 face_restored:0,3 tile/seat_front +fx/twk_s_g:27,8",
                m: 1
              }
            ]
          },
          bust: {
            loop: true,
            w: 64,
            h: 64,
            ax: 32,
            ay: 63,
            frames: [
              { d: 700, l: "b_torso:0,0 b_head:0,0 ~b_face:0,0 +~b_over:0,0" },
              { d: 700, l: "b_torso:0,1 b_head:0,1 ~b_face:0,1 +~b_over:0,1" }
            ]
          }
        },
        label: "스켈레톤",
        pal2: { w: "s", i: "s", y: "t", O: "B", B: "A", b: "C", n: "O" }
      },
      ghost: {
        kind: "undead",
        w: 32,
        h: 32,
        ax: 16,
        ay: 31,
        pieces: {
          head: {
            x: 8,
            y: 3,
            r: [
              ".....cccccc.....",
              "...cccCCCCCCc...",
              "..ccCCCCCCCCCA..",
              ".ccCCCCCCCCCCCA.",
              ".cCCCCCCCCCCCCA.",
              "ccCCCCCCCCCCCCAA",
              "cCCCCCCCCCCCCCAA",
              "cCCCCCCCCCCCCCAA",
              "cCCCCCCCCCCCCCAA",
              "cCCCCCCCCCCCCCAA",
              "cCCCCCCCCCCCCCAA",
              "cCCCCCCCCCCCCCAA",
              "cCCCCCCCCCCCCCAA",
              "cAACCCCCCAAAAAAA",
              "cAAAAAAAAAAAAAAA",
              ".....AAAAAA....."
            ]
          },
          face_waiting: {
            x: 11,
            y: 10,
            r: ["kk......kk", "wk......wk", "kk......kk", "..........", "..........", "...kkkk..."]
          },
          face_angry: {
            x: 10,
            y: 8,
            r: [
              "dd..........dd",
              ".dd........dd.",
              ".RR......RR...",
              ".RR......RR...",
              ".Rw......wR...",
              "..............",
              "..............",
              "....kkkk......",
              "....k..k......"
            ]
          },
          face_leaving: {
            x: 11,
            y: 10,
            r: ["kk......kk", "wk......wk", "kk......kk", "..........", "...k..k...", "....kk...."]
          },
          face_satisfied: {
            x: 9,
            y: 11,
            r: [
              "...k.......k..",
              "..k.k.....k.k.",
              "rr..........rr",
              "rr...k..k...rr",
              "......kk......"
            ]
          },
          face_hit: {
            x: 11,
            y: 10,
            r: ["k.k.....k.k", ".k.......k.", "k.k.....k.k", "...........", "...........", "....kk.....", "....kk....."]
          },
          face_restored: {
            x: 9,
            y: 10,
            r: [
              "..kk......kk..",
              "..wk......wk..",
              "..kn......kn..",
              "rr..........rr",
              "rr...kkkk...rr",
              ".....kRRk.....",
              "......kk......"
            ]
          },
          over_leaving: {
            x: 14,
            y: 0,
            r: ["..a..", ".aaa.", "aaaaa", "..a..", "..a.."]
          },
          over_satisfied: {
            x: 25,
            y: 2,
            r: [".G.", "GwG", ".G."]
          },
          over_angry: {
            x: 25,
            y: 3,
            r: ["R.R", ".R.", "R.R"]
          },
          torso: {
            x: 8,
            y: 18,
            r: [
              "cccccccccccccccc",
              "cCCCCCCCCCCCCCAA",
              "cCCCACCCACCCACAA",
              "cCCCACCCACCCACAA",
              "cCCCACCCACCCACAA",
              "cCCCACCCACCCACAA",
              "cAAAAAAAAAAAAAAA",
              "cAAAAAAAAAAAAAAA"
            ]
          },
          legs_0: {
            x: 8,
            y: 26,
            r: [
              "CCCCCCCCCCCAAAAA",
              "C...CCC...CAA...",
              "....C.....C....."
            ]
          },
          legs_a: {
            x: 8,
            y: 26,
            r: [
              "CCCCCCCCCCCAAAAA",
              "..CCC...CCC...AA",
              "..C.....C.....A."
            ]
          },
          legs_b: {
            x: 8,
            y: 26,
            r: [
              "CCCCCCCCCCCAAAAA",
              "CCC...CCC...AAA.",
              "C.....C.....A..."
            ]
          },
          legs_p: {
            x: 8,
            y: 26,
            r: [
              "CCCCCCCCCCCAAAAA",
              "...CCC...CCA...A",
              "...C.....C.....A"
            ]
          },
          armL_0: {
            x: 4,
            y: 19,
            r: ["....cc.", "...cCAA", ".ccCAA.", "cCAAA..", "cAA....", "AA....."],
            ol: "d"
          },
          armR_0: {
            x: 21,
            y: 19,
            r: [".cc....", "AACc...", ".AACcc.", "..AAACc", "....AAc", ".....AA"],
            ol: "d"
          },
          armL_1: {
            x: 4,
            y: 19,
            r: ["..cccc.", "ccCCCAA", "AAAAAA."],
            ol: "d"
          },
          armR_1: {
            x: 21,
            y: 19,
            r: [".cccc..", "AACCCcc", ".AAAAAA"],
            ol: "d"
          },
          armL_up: {
            x: 4,
            y: 13,
            r: [".c.....", "cCc....", ".cCA...", ".cCC...", "..cCc..", "..cCCA.", "...cCC.", "...cCAA", "....AA."],
            ol: "d"
          },
          armR_up: {
            x: 21,
            y: 13,
            r: [".....c.", "....cCc", "...ACc.", "...CCc.", "..cCc..", ".ACCc..", ".CCc...", "AACc...", ".AA...."],
            ol: "d"
          },
          armL_hit: {
            x: 4,
            y: 15,
            r: [".c.....", "cCc....", ".cCc...", ".cCCc..", "..cCCc.", "...cCAA", "....AA."],
            ol: "d"
          },
          armR_hit: {
            x: 21,
            y: 15,
            r: [".....c.", "....cCc", "...cCc.", "..cCCc.", ".cCCc..", "AACc...", ".AA...."],
            ol: "d"
          },
          b_head: {
            x: 9,
            y: 0,
            r: [
              "................cccccccccccccc.................",
              "..............cccccccccccccccccc...............",
              "............ccccccCCCCCCCCCCCCCCcc.............",
              "..........ccccccCCCCCCCCCCCCCCCCCCcc...........",
              ".........cccccCCCCCCCCCCCCCCCCCCCCCCc..........",
              ".......cccccCCCCCCCCCCCCCCCCCCCCCCCCCCc........",
              "......cccccCCCCCCCCCCCCCCCCCCCCCCCCCCCCc.......",
              "......cccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCA.......",
              ".....cccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCA......",
              "....ccccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAA.....",
              "...ccccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAA....",
              "...cccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAA....",
              "..cccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAA...",
              "..cccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAA...",
              ".cccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAA..",
              ".cccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAA..",
              ".ccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAA..",
              "cccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAA.",
              "cccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAA.",
              "ccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAA.",
              "ccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAA.",
              "ccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAA.",
              "ccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAA.",
              "ccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAA",
              "ccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAA",
              "ccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAA",
              "ccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAA",
              "ccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAA",
              "ccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAA",
              "ccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAA",
              "ccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAA",
              "ccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAA",
              "ccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAA",
              "ccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAA",
              "ccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAA",
              "ccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAA",
              "ccAACCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAAAAAAAAAAA",
              "ccAAAACCCCCCCCCCCCCCCCCCCCCCCCCCAAAAAAAAAAAAAAA",
              "ccAAAAACCCCCCCCCCCCCCCCCCCCCCCCAAAAAAAAAAAAAAAA",
              "ccAAAAAAACCCCCCCCCCCCCCCCCCCCAAAAAAAAAAAAAAAAAA",
              "........AAAACCCCCCCCCCCCCCAAAAAAAAAAAA.........",
              "..........AAAAAACCCCCCAAAAAAAAAAAAAA...........",
              "...........AAAAAAAAAAAAAAAAAAAAAAAA............",
              ".............AAAAAAAAAAAAAAAAAAAA..............",
              "................AAAAAAAAAAAAAA.................",
              "....................AAAAAA.....................",
              "...........A...................................",
              "...........A...................................",
              "...........A...................................",
              "...........A...................................",
              "...........A...................................",
              "...........A...................................",
              "...........A...................................",
              "...........A...................................",
              "...........A...................................",
              "...........A...................................",
              "...........A...................................",
              "...........A...................................",
              "...........A...................................",
              "...........A...................................",
              "...........A...................................",
              "...........A...................................",
              "...........A..................................."
            ],
            ol: "d"
          },
          b_torso: {
            x: 0,
            y: 44,
            r: [
              ".........ccccccccccccccccccccccccccccccccccccccccccccccc........",
              ".........cCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAA........",
              ".........cCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAA........",
              ".........cCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAA........",
              ".........cCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAA........",
              ".........cCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAA........",
              "...CCCCCCcCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAAAAAAA...",
              ".CCccccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAAAAAAAAA.",
              "CCccccccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAAAAAAAAAA",
              "CCccccccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAAAAAAAAAA",
              "CCCccccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAAAAAAAAAA",
              "CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAAAAAAAAAA",
              ".CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAAAAAAAAA.",
              "...CCCCCCcCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCAAAAAAAAA...",
              ".........cACCCCCAAAAACCCCCAAAAACCCCCAAAAACCCCCAAAAACAAAA........",
              ".........cACCCCCAAAAACCCCCAAAAACCCCCAAAAACCCCCAAAAACAAAA........",
              ".........cACCCCCAAAAACCCCCAAAAACCCCCAAAAACCCCCAAAAACAAAA........",
              ".........c.....AAAAA.....AAAAA.....AAAAA.....AAAAA.....A........",
              ".........c.....cAAAA.....cAAAA.....cAAAA.....cAAAA.....c........",
              ".........c.....cAAAA.....cAAAA.....cAAAA.....cAAAA.....c........"
            ],
            ol: "d"
          },
          b_face_waiting: {
            x: 17,
            y: 22,
            r: [
              ".kkkk...................kkkk.",
              "kwwkkk.................kwwkkk",
              "kwwkkk.................kwwkkk",
              "kwwkkk.................kwwkkk",
              "kwwkkk.................kwwkkk",
              "kkkkkk.................kkkkkk",
              "kkkkkk.................kkkkkk",
              "kkkkkk.................kkkkkk",
              "kkkkkk.................kkkkkk",
              ".kkkk...................kkkk.",
              ".............................",
              ".............................",
              ".............................",
              ".............................",
              ".............................",
              ".............................",
              ".............................",
              ".............................",
              ".............................",
              "............kkkkkk..........."
            ]
          },
          b_face_angry: {
            x: 12,
            y: 20,
            r: [
              "d......................................d",
              "ddd.................................dddd",
              "dddddd............................dddddd",
              ".ddddddd........................ddddddd.",
              "....dddddd...................ddddddd....",
              ".....Rwdddddd..............ddddddR......",
              ".....RwwRRdddd............ddddwRRR......",
              ".....RwwRRR..d............d.RwwRRR......",
              ".....RwwRRR.................RwwRRR......",
              ".....RRRRRR.................RRRRRR......",
              ".....RRRRRR.................RRRRRR......",
              ".....RRRRRR.................RRRRRR......",
              ".....RRRRRR.................RRRRRR......",
              "......RRRR...................RRRR.......",
              "........................................",
              "........................................",
              "........................................",
              "........................................",
              "........................................",
              "........................................",
              "........................................",
              "........................................",
              "................kkkkkkkk................",
              "................k......k................"
            ]
          },
          b_face_leaving: {
            x: 17,
            y: 22,
            r: [
              ".kkkk...................kkkk.",
              "kwwkkk.................kwwkkk",
              "kwwkkk.................kwwkkk",
              "kwwkkk.................kwwkkk",
              "kwwkkk.................kwwkkk",
              "kkkkkk.................kkkkkk",
              "kkkkkk.................kkkkkk",
              "kkkkkk.................kkkkkk",
              "kkkkkk.................kkkkkk",
              ".kkkk...................kkkk.",
              ".............................",
              ".............................",
              ".............................",
              ".............................",
              ".............................",
              ".............................",
              ".............................",
              ".............................",
              "..........k........k.........",
              "...........kkkkkkkk.........."
            ]
          },
          b_face_satisfied: {
            x: 12,
            y: 27,
            r: [
              ".......kkkk...................kkkk..........",
              "......k....k.................k....k.........",
              ".....k......k...............k......k........",
              "............................................",
              "............................................",
              "............................................",
              "............................................",
              "............................................",
              "............................................",
              "rrrrrr................................rrrrrr",
              "rrrrrr................................rrrrrr",
              "rrrrrr................................rrrrrr",
              "............................................",
              "...............k........k...................",
              "................kkkkkkkk...................."
            ]
          },
          b_face_hit: {
            x: 17,
            y: 24,
            r: [
              "k....k.................k....k",
              ".k..k...................k..k.",
              "..kk.....................kk..",
              "..kk.....................kk..",
              ".k..k...................k..k.",
              "k....k.................k....k",
              ".............................",
              ".............................",
              ".............................",
              ".............................",
              ".............................",
              ".............................",
              ".............................",
              ".............................",
              ".............................",
              ".............................",
              ".............................",
              ".............................",
              ".............kkk.............",
              ".............kwk.............",
              ".............kkk............."
            ]
          },
          b_face_restored: {
            x: 13,
            y: 24,
            r: [
              ".....kkkk.................kkkk............",
              "....kwwkkk...............kwwkkk...........",
              "....kwwkkk...............kwwkkk...........",
              "....kkkkkk...............kkkkkk...........",
              "....kOOOOk...............kOOOOk...........",
              "....kOBBOk...............kOBBOk...........",
              ".....kkkk.................kkkk............",
              "..........................................",
              "..........................................",
              "..........................................",
              "..........................................",
              "..........................................",
              "rrrrrr..............................rrrrrr",
              "rrrrrr..............................rrrrrr",
              "rrrrrr..............................rrrrrr",
              "...............kkkkkkkk...................",
              "...............kwwwwwwk...................",
              "...............kRRRRRRk...................",
              "................kRRRRk....................",
              ".................kkkk....................."
            ]
          },
          b_over_leaving: {
            x: 29,
            y: 0,
            r: ["...a...", "..aaa..", ".aaaaa.", "aaaaaaa", "...a...", "...a...", "...a..."]
          },
          b_over_satisfied: {
            x: 54,
            y: 4,
            r: ["..G..", "..G..", "GGwGG", "..G..", "..G.."]
          },
          b_over_angry: {
            x: 54,
            y: 6,
            r: ["R...R", ".R.R.", "..R..", ".R.R.", "R...R"]
          }
        },
        anims: {
          idle: {
            loop: true,
            frames: [
              { d: 420, l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0" },
              { d: 420, l: "legs_0:0,0 torso:0,0 armL_1:0,0 armR_1:0,0 head:0,1 ~face:0,1 +~over:0,1" }
            ]
          },
          walk: {
            loop: true,
            frames: [
              { d: 140, l: "legs_a:0,0 torso:0,0 armL_1:0,0 armR_1:0,0 head:0,0 ~face:0,0 +~over:0,0" },
              {
                d: 140,
                l: "legs_p:0,0 torso:0,-1 armL_0:0,-1 armR_0:0,-1 head:0,-1 ~face:0,-1 +~over:0,-1"
              },
              { d: 140, l: "legs_b:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0" },
              {
                d: 140,
                l: "legs_p:0,0 torso:0,-1 armL_0:0,-1 armR_0:0,-1 head:0,-1 ~face:0,-1 +~over:0,-1"
              }
            ]
          },
          attack: {
            loop: false,
            frames: [
              { d: 110, l: "legs_0:1,0 torso:1,0 armL_1:1,0 armR_1:1,0 head:1,1 face_angry:1,1" },
              { d: 90, l: "legs_a:-2,0 torso:-2,1 armL_up:-2,1 armR_up:-2,1 head:-2,1 face_angry:-2,1" },
              {
                d: 140,
                l: "legs_p:-1,0 torso:-1,0 armL_up:-1,0 armR_up:-1,0 head:-1,0 face_angry:-1,0"
              }
            ]
          },
          hit: {
            loop: false,
            frames: [
              { d: 200, l: "legs_0:1,0 torso:1,0 armL_hit:1,0 armR_hit:1,0 head:1,0 face_hit:1,0" }
            ]
          },
          mood: {
            loop: true,
            frames: [
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "waiting"
              },
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "angry"
              },
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "leaving"
              },
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "satisfied"
              }
            ]
          },
          restore: {
            loop: false,
            frames: [
              {
                d: 200,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,1 face_waiting:0,1",
                g: 1
              },
              {
                d: 150,
                l: "-tile/beam legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,1 face_waiting:0,1",
                g: 1
              },
              {
                d: 150,
                l: "-tile/beam legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 face_waiting:0,0",
                g: 0.75,
                h: 0.25
              },
              {
                d: 150,
                l: "-tile/beam legs_0:0,0 torso:0,-1 armL_1:0,-1 armR_1:0,-1 head:0,-1 face_leaving:0,-1 +fx/twk_s_g:3,6 +fx/twk_s_g:26,9",
                g: 0.45,
                m: 0.25,
                h: 0.5
              },
              {
                d: 110,
                l: "legs_0:0,0 torso:0,-2 armL_up:0,-2 armR_up:0,-2 head:0,-2 face_restored:0,-2 +fx/twk_m_g:2,4 +fx/twk_m_g:27,7 +fx/twk_s_g:14,1",
                g: 0.15,
                m: 0.6,
                h: 0.8,
                f: 0.55
              },
              {
                d: 110,
                l: "legs_0:0,0 torso:0,-3 armL_up:0,-3 armR_up:0,-3 head:0,-3 face_restored:0,-3 +fx/twk_l_g:2,5 +fx/twk_s_g:27,4 +fx/twk_s_g:8,1",
                g: 0,
                m: 1,
                h: 0.5,
                f: 0.2
              },
              {
                d: 120,
                l: "legs_0:0,0 torso:0,-1 armL_up:0,-1 armR_up:0,-1 head:0,-1 face_restored:0,-1 +fx/twk_s_g:3,8 +fx/twk_m_g:26,6",
                g: 0,
                m: 1,
                h: 0.25
              },
              {
                d: 260,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 face_restored:0,0 +fx/heart:24,3",
                g: 0,
                m: 1,
                h: 0
              }
            ]
          },
          audience: {
            loop: true,
            frames: [
              {
                d: 300,
                l: "torso:0,4 armL_0:0,4 armR_0:0,4 head:0,4 face_restored:0,4 tile/seat_front",
                m: 1
              },
              {
                d: 260,
                l: "torso:0,4 armL_up:0,4 armR_0:0,4 head:0,3 face_restored:0,3 tile/seat_front +fx/twk_s_g:3,8",
                m: 1
              },
              {
                d: 260,
                l: "torso:0,3 armL_up:0,3 armR_up:0,3 head:0,3 face_restored:0,3 tile/seat_front",
                m: 1
              },
              {
                d: 260,
                l: "torso:0,4 armL_0:0,4 armR_up:0,4 head:0,3 face_restored:0,3 tile/seat_front +fx/twk_s_g:27,8",
                m: 1
              }
            ]
          },
          bust: {
            loop: true,
            w: 64,
            h: 64,
            ax: 32,
            ay: 63,
            frames: [
              { d: 700, l: "b_torso:0,0 b_head:0,0 ~b_face:0,0 +~b_over:0,0" },
              { d: 700, l: "b_torso:0,1 b_head:0,1 ~b_face:0,1 +~b_over:0,1" }
            ]
          }
        },
        label: "고스트",
        pal2: { c: "w", C: "p", A: "P", d: "q" }
      },
      dracula: {
        kind: "undead",
        w: 32,
        h: 32,
        ax: 16,
        ay: 31,
        pieces: {
          head: {
            x: 8,
            y: 3,
            r: [
              "...xxxRxxxxxx...",
              "..xxRRxxxxxxxx..",
              ".xRRxxxxxxxxxxx.",
              "xxxxxxxxkxxxxxxx",
              "xRxxxxxxkxxxxxxx",
              "xRccccxxkxccccxx",
              "wccccccxkcccccpx",
              "wcccccccccccccpp",
              "wccccccccccccppp",
              "wccccccccccccppp",
              ".cccccccccccppp.",
              ".wccccccccppppp.",
              "..pppccppppppp..",
              "....pppppppp....",
              ".......pp......."
            ]
          },
          face_waiting: {
            x: 10,
            y: 10,
            r: ["www......www", "wRw......wRw", "www......www", "............", "...kkkkkk...", "...w....w...", "...w....w..."]
          },
          face_angry: {
            x: 10,
            y: 8,
            r: [
              "kk..........kk",
              ".kk........kk.",
              "RRR......RRR..",
              "RwR......RwR..",
              "..............",
              "..............",
              "...kkkkkk.....",
              "...w....w.....",
              "...w....w....."
            ]
          },
          face_leaving: {
            x: 10,
            y: 10,
            r: ["www......www", "wTw......wTw", "www......www", "...k....k...", "....kkkk....", "...w....w...", "...w....w..."]
          },
          face_satisfied: {
            x: 9,
            y: 11,
            r: [
              "..k........k..",
              ".k.k......k.k.",
              "rr..k....k..rr",
              "rr...kkkk...rr",
              "....w....w....",
              "....w....w...."
            ]
          },
          face_hit: {
            x: 10,
            y: 10,
            r: ["k.k......k.k", ".k........k.", "k.k......k.k", "............", ".....kkk....", ".....kwk...."]
          },
          face_restored: {
            x: 9,
            y: 10,
            r: [
              "..kk......kk..",
              "..wk......wk..",
              "..kn......kn..",
              "rr..........rr",
              "rr..wkkkkw..rr",
              "....wkRRkw....",
              "......kk......"
            ]
          },
          over_leaving: {
            x: 14,
            y: 0,
            r: ["..a..", ".aaa.", "aaaaa", "..a..", "..a.."]
          },
          over_satisfied: {
            x: 25,
            y: 2,
            r: [".G.", "GwG", ".G."]
          },
          over_angry: {
            x: 25,
            y: 3,
            r: ["R.R", ".R.", "R.R"]
          },
          torso: {
            x: 9,
            y: 16,
            r: [
              "qP......xx......Pq",
              "qPp....xRRx....pPq",
              "qPPP.xxRRRRxx.PPPq",
              ".qPPPPxRRRRxPPPPq.",
              ".qPPPPPPggPPPPPPq.",
              ".qPPPPPPPPPPPPPPq.",
              ".qPPPPPPPPPPPPPPq.",
              "..qPPPPPPPPPPPPq..",
              "..qPPPPPPPPPPPPq..",
              "..qPPPPPPPPPPPPq..",
              "...qPPPPPPPPPPq...",
              "...qqqqqqqqqqqq..."
            ]
          },
          armL_0: {
            x: 5,
            y: 18,
            r: ["......p.", "....ppPq", "...pPPPq", "..pPPPqq", ".pPPPqq.", "pwwPqq..", "wwwwq...", "qwwq...."],
            ol: "q"
          },
          armR_0: {
            x: 19,
            y: 18,
            r: [".p......", "qPpp....", "qPPPp...", "qqPPPp..", ".qqPPPp.", "..qqPwwp", "...qwwww", "....qwwq"],
            ol: "q"
          },
          armL_1: {
            x: 4,
            y: 18,
            r: ["......pp.", "..ppppPPq", "pwwPPPPqq", "wwwwPqqq.", "qwwqqq..."],
            ol: "q"
          },
          armR_1: {
            x: 19,
            y: 18,
            r: [".pp......", "qPPpppp..", "qqPPPPwwp", ".qqqPwwww", "...qqqwwq"],
            ol: "q"
          },
          armL_up: {
            x: 4,
            y: 12,
            r: ["pwp......", "wwwp.....", "wwwPp....", "pwPPPp...", ".pPPPPp..", "..pPPPPp.", "...pPPPPq", "....pPPPq", ".....qPqq", ".......q."],
            ol: "q"
          },
          armR_up: {
            x: 19,
            y: 12,
            r: ["......pwp", ".....pwww", "....pPwww", "...pPPPwp", "..pPPPPp.", ".pPPPPp..", "qPPPPp...", "qPPPp....", "qqPq.....", ".q......."],
            ol: "q"
          },
          armL_hit: {
            x: 4,
            y: 15,
            r: ["..p......", ".wwwp....", "pwwwPpp..", ".wwwPPPp.", "..qPPPPPq", "....qPPqq", "......qq."],
            ol: "q"
          },
          armR_hit: {
            x: 19,
            y: 15,
            r: ["......p..", "....pwww.", "..ppPwwwp", ".pPPPwww.", "qPPPPPq..", "qqPPq....", ".qq......"],
            ol: "q"
          },
          legs_0: {
            x: 12,
            y: 28,
            r: ["nnn..nnn.", "kkkk.kkkk"]
          },
          legs_a: {
            x: 12,
            y: 28,
            r: ["nnn..nnn.", "nnn..kkkk", "kkkk....."]
          },
          legs_b: {
            x: 12,
            y: 28,
            r: ["nnn..nnn.", "kkkk.nnn.", ".....kkkk"]
          },
          legs_p: {
            x: 12,
            y: 28,
            r: ["nnn..nnn.", "kkkk.kkkk"]
          },
          b_head: {
            x: 9,
            y: 0,
            r: [
              "...............xxxxxxxxxxxxxxxx...............",
              ".........xxxxxxxxxxxxxxxxxxxxxxxxxxxx.........",
              "........xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx........",
              ".......xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.......",
              "......xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx......",
              ".....xxxxxxxRRxxxxxxxxxxxxxxxxxxxxxxxxxxx.....",
              "....xxxxxRRRxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx....",
              "....xxxRRxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx....",
              "...xxRRxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx...",
              "..xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx..",
              "..xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx..",
              "..xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx..",
              "..xRxxxxxxxxxxxxxxxxxkxxxkxxxxxxxxxxxxxxxxxx..",
              "..Rxxxxxxxxxccxxxxxxxkxxxkxxxxxxccxxxxxxxxxx..",
              "..Rxxxcccccccccxxxxxxkxkxkxxxxxcccccccccxxxx..",
              ".Rxxxcccccccccccxxxxxkxkxkxxxxcccccccccccxxx..",
              ".Rxxcccccccccccccxxxxkxkxkxxxcccccccccccccxxx.",
              ".xxwcccccccccccccccxxxxkxxxcccccccccccccccpxx.",
              ".xwcccccccccccccccccxxxkxxccccccccccccccccppx.",
              ".wwccccccccccccccccccxxkxccccccccccccccccpppp.",
              "wwwcccccccccccccccccccxkcccccccccccccccccppppp",
              "wwwcccccccccccccccccccckcccccccccccccccccppppp",
              "wwccccccccccccccccccccckcccccccccccccccccppppp",
              ".wccccccccccccccccccccckccccccccccccccccppppp.",
              ".wccccccccccccccccccccckccccccccccccccccppppp.",
              ".wwcccccccccccccccccccccccccccccccccccccppppp.",
              ".wwccccccccccccccccccccccccccccccccccccpppppp.",
              "..wcccccccccccccccccccccccccccccccccccpppppp..",
              "..wcccccccccccccccccccccccccccccccccccpppppp..",
              "..wwcccccccccccccccccccccccccccccccccppppppp..",
              "...wccccccccccccccccccccccccccccccccppppppp...",
              "....cccccccccccccccccccccccccccccccppppppp....",
              "....wccccccccccccccccccccccccccccppppppppp....",
              ".....wccccccccccccccccccccccccccppppppppp.....",
              "......ppccccccccccccccccccccccpppppppppp......",
              ".......ppppccccccccccccccccpppppppppppp.......",
              ".........ppppppccccccccpppppppppppppp.........",
              "..........pppppppppppppppppppppppppp..........",
              "............pppppppppppppppppppppp............",
              "...............pppppppppppppppp...............",
              "...................pppppppp..................."
            ],
            ol: "k"
          },
          b_torso: {
            x: 2,
            y: 37,
            r: [
              "......q..............................................q......",
              "......qq............................................qq......",
              "......qqq..........................................qqq......",
              "......qqqq........................................qxqq......",
              "......qqxqq......................................qxxqq......",
              "......qqxxqq....................................qxxxqq......",
              "......qqxxxq....................................xxxxqq......",
              "......qqxxxxqppppppppppppppppppppppppppppppppppxxxxxqq......",
              "......qqxxxxxqPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPxxxxxxqq......",
              ".....pqqxxxxxxqPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPxxxxxxxqqq.....",
              ".....pqqxxxxxxxqPPPPPPPPPPPPPPPPPPPPPPPPPPPPxxxxxxxxqqq.....",
              ".....pqqxxxxxxxxqPPPPPPPPPPPPPPPPPPPPPPPPPPxxxxxxxxxqqq.....",
              "....ppqqxxxxxxxxxqPPPPPPPPPPPPPPPPPPPPPPPPxxxxxxxxxxqqqq....",
              "....pPqqxxxxxxxqqPPPPPxxxRRRRRRRRRRxxxPPPPPqxxxxxxxxqqqq....",
              "....pPqqxxqqqqqPPPPPPPPxxxRRRRRRRRxxxPPPPPPPPqqqqxxxqqqq....",
              "...ppPqqqqqqqPPPPPPPPPPPxxxRRRRRRxxxPPPPPPPPPPPqqqqqqqqqq...",
              "...pPPqqqqqPPPPPPPPPPPPPPxxRRRRRxxxPPPPPPPPPPPPPPqqqqqqqq...",
              "...pPPqqqPPPPPPPPPPPPPPPPPxxRRRRxxPPPPPPPPPPPPPPPPPqqqqqq...",
              "...pPPqPPPPPPPPPPPPPPPPPPPxxxRRxxxPPPPPPPPPPPPPPPPPPPqqqq...",
              "..ppPPPPPPPPPPPPPPPPPPPPPPPxxggxxPPPPPPPPPPPPPPPPPPPPPPqqq..",
              "..pPPPPPPPPPPPPPPPPPPPPPPPPPxgGxPPPPPPPPPPPPPPPPPPPPPPPqqq..",
              "..pPPPPPPPPPPPPPPPPPPPPPPPPPPxxPPPPPPPPPPPPPPPPPPPPPPPPqqq..",
              ".ppPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPqqq.",
              ".pPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPqqq.",
              ".pqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq.",
              "ppqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
              "pqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"
            ],
            ol: "k"
          },
          b_face_waiting: {
            x: 16,
            y: 25,
            r: [
              "....ww....................ww....",
              "..wwwwww................wwwwww..",
              ".wwwwwwww..............wwwwwwww.",
              ".wwRRRRww..............wwRRRRww.",
              "wwwRwRRwww............wwwRwRRwww",
              "wwRRRRRRww............wwRRRRRRww",
              ".wwRRRRww..............wwRRRRww.",
              ".wwRRRRww..............wwRRRRww.",
              "..wwwwww................wwwwww..",
              "....ww....................ww....",
              "................................",
              "................................",
              "................................",
              "................................",
              "................................",
              "...........kkkkkkkkkk...........",
              "..........wwkkkkkkkkww..........",
              "..........ww........ww..........",
              "..........w..........w.........."
            ]
          },
          b_face_angry: {
            x: 14,
            y: 23,
            r: [
              "k..................................k",
              "kkk..............................kkk",
              "kkkkk..........................kkkkk",
              "kkkkkkkk....................kkkkkkkk",
              "..kkkkkkkk................kkkkkkkk..",
              "...wwkkkkkkk............kkkkkkkww...",
              "...wwRRRkkkkk..........kkkkkRRRww...",
              "..wwwRwRRwwkk..........kkwwRwRRwww..",
              "..wwRRRRRRww............wwRRRRRRww..",
              "...wwRRRRww..............wwRRRRww...",
              "...wwRRRRww..............wwRRRRww...",
              "....wwwwww................wwwwww....",
              "......ww....................ww......",
              "....................................",
              "....................................",
              "....................................",
              "....................................",
              ".............kkkkkkkkkk.............",
              "............wwkkkkkkkkww............",
              "............ww........ww............",
              "............w..........w............"
            ]
          },
          b_face_leaving: {
            x: 16,
            y: 25,
            r: [
              "....ww....................ww....",
              "..wwwwww................wwwwww..",
              ".wwwwwwww..............wwwwwwww.",
              ".wwTTTTww..............wwTTTTww.",
              "wwwTwTTwww............wwwTwTTwww",
              "wwTTTTTTww............wwTTTTTTww",
              ".wwTTTTww..............wwTTTTww.",
              ".wwTTTTww..............wwTTTTww.",
              "..wwwwww................wwwwww..",
              "....ww....................ww....",
              "................................",
              "................................",
              "................................",
              "...........k........k...........",
              "............kkkkkkkk............",
              "................................",
              "..........ww........ww..........",
              "..........ww........ww..........",
              "..........w..........w.........."
            ]
          },
          b_face_satisfied: {
            x: 12,
            y: 28,
            r: [
              "........kkkk..................kkkk..........",
              ".......k....k................k....k.........",
              "......k......k..............k......k........",
              "............................................",
              "............................................",
              "............................................",
              "............................................",
              "............................................",
              "rrrrrr................................rrrrrr",
              "rrrrrr................................rrrrrr",
              "rrrrrr.........k........k.............rrrrrr",
              "................kkkkkkkk....................",
              "............................................",
              "..............ww........ww..................",
              "..............ww........ww..................",
              "..............w..........w.................."
            ]
          },
          b_face_hit: {
            x: 18,
            y: 26,
            r: [
              "k....k................k....k",
              ".k..k..................k..k.",
              "..kk....................kk..",
              "..kk....................kk..",
              ".k..k..................k..k.",
              "k....k................k....k",
              "............................",
              "............................",
              "............................",
              "............................",
              "............................",
              "............................",
              "............................",
              "............................",
              "............................",
              "............kkk.............",
              "............kwk.............",
              "............kkk............."
            ]
          },
          b_face_restored: {
            x: 13,
            y: 26,
            r: [
              ".....kkkk.................kkkk............",
              "....kwwkkk...............kwwkkk...........",
              "....kwwkkk...............kwwkkk...........",
              "....kkkkkk...............kkkkkk...........",
              "....kOOOOk...............kOOOOk...........",
              "....kOBBOk...............kOBBOk...........",
              ".....kkkk.................kkkk............",
              "..........................................",
              "..........................................",
              "..........................................",
              "rrrrrr..............................rrrrrr",
              "rrrrrr..............................rrrrrr",
              "rrrrrr.......w..........w...........rrrrrr",
              ".............w.kkkkkkkk.w.................",
              "...............kwwwwwwk...................",
              "...............kRRRRRRk...................",
              "................kRRRRk....................",
              ".................kkkk....................."
            ]
          },
          b_over_leaving: {
            x: 29,
            y: 0,
            r: ["...a...", "..aaa..", ".aaaaa.", "aaaaaaa", "...a...", "...a...", "...a..."]
          },
          b_over_satisfied: {
            x: 54,
            y: 4,
            r: ["..G..", "..G..", "GGwGG", "..G..", "..G.."]
          },
          b_over_angry: {
            x: 54,
            y: 6,
            r: ["R...R", ".R.R.", "..R..", ".R.R.", "R...R"]
          }
        },
        anims: {
          idle: {
            loop: true,
            frames: [
              { d: 420, l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0" },
              { d: 420, l: "legs_0:0,0 torso:0,0 armL_1:0,0 armR_1:0,0 head:0,1 ~face:0,1 +~over:0,1" }
            ]
          },
          walk: {
            loop: true,
            frames: [
              { d: 140, l: "legs_a:0,0 torso:0,0 armL_1:0,0 armR_1:0,0 head:0,0 ~face:0,0 +~over:0,0" },
              {
                d: 140,
                l: "legs_p:0,0 torso:0,-1 armL_0:0,-1 armR_0:0,-1 head:0,-1 ~face:0,-1 +~over:0,-1"
              },
              { d: 140, l: "legs_b:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0" },
              {
                d: 140,
                l: "legs_p:0,0 torso:0,-1 armL_0:0,-1 armR_0:0,-1 head:0,-1 ~face:0,-1 +~over:0,-1"
              }
            ]
          },
          attack: {
            loop: false,
            frames: [
              { d: 110, l: "legs_0:1,0 torso:1,0 armL_1:1,0 armR_1:1,0 head:1,1 face_angry:1,1" },
              { d: 90, l: "legs_a:-2,0 torso:-2,1 armL_up:-2,1 armR_up:-2,1 head:-2,1 face_angry:-2,1" },
              {
                d: 140,
                l: "legs_p:-1,0 torso:-1,0 armL_up:-1,0 armR_up:-1,0 head:-1,0 face_angry:-1,0"
              }
            ]
          },
          hit: {
            loop: false,
            frames: [
              { d: 200, l: "legs_0:1,0 torso:1,0 armL_hit:1,0 armR_hit:1,0 head:1,0 face_hit:1,0" }
            ]
          },
          mood: {
            loop: true,
            frames: [
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "waiting"
              },
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "angry"
              },
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "leaving"
              },
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "satisfied"
              }
            ]
          },
          restore: {
            loop: false,
            frames: [
              {
                d: 200,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,1 face_waiting:0,1",
                g: 1
              },
              {
                d: 150,
                l: "-tile/beam legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,1 face_waiting:0,1",
                g: 1
              },
              {
                d: 150,
                l: "-tile/beam legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 face_waiting:0,0",
                g: 0.75,
                h: 0.25
              },
              {
                d: 150,
                l: "-tile/beam legs_0:0,0 torso:0,-1 armL_1:0,-1 armR_1:0,-1 head:0,-1 face_leaving:0,-1 +fx/twk_s_g:3,6 +fx/twk_s_g:26,9",
                g: 0.45,
                m: 0.25,
                h: 0.5
              },
              {
                d: 110,
                l: "legs_0:0,0 torso:0,-2 armL_up:0,-2 armR_up:0,-2 head:0,-2 face_restored:0,-2 +fx/twk_m_g:2,4 +fx/twk_m_g:27,7 +fx/twk_s_g:14,1",
                g: 0.15,
                m: 0.6,
                h: 0.8,
                f: 0.55
              },
              {
                d: 110,
                l: "legs_0:0,0 torso:0,-3 armL_up:0,-3 armR_up:0,-3 head:0,-3 face_restored:0,-3 +fx/twk_l_g:2,5 +fx/twk_s_g:27,4 +fx/twk_s_g:8,1",
                g: 0,
                m: 1,
                h: 0.5,
                f: 0.2
              },
              {
                d: 120,
                l: "legs_0:0,0 torso:0,-1 armL_up:0,-1 armR_up:0,-1 head:0,-1 face_restored:0,-1 +fx/twk_s_g:3,8 +fx/twk_m_g:26,6",
                g: 0,
                m: 1,
                h: 0.25
              },
              {
                d: 260,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 face_restored:0,0 +fx/heart:24,3",
                g: 0,
                m: 1,
                h: 0
              }
            ]
          },
          audience: {
            loop: true,
            frames: [
              {
                d: 300,
                l: "torso:0,4 armL_0:0,4 armR_0:0,4 head:0,4 face_restored:0,4 tile/seat_front",
                m: 1
              },
              {
                d: 260,
                l: "torso:0,4 armL_up:0,4 armR_0:0,4 head:0,3 face_restored:0,3 tile/seat_front +fx/twk_s_g:3,8",
                m: 1
              },
              {
                d: 260,
                l: "torso:0,3 armL_up:0,3 armR_up:0,3 head:0,3 face_restored:0,3 tile/seat_front",
                m: 1
              },
              {
                d: 260,
                l: "torso:0,4 armL_0:0,4 armR_up:0,4 head:0,3 face_restored:0,3 tile/seat_front +fx/twk_s_g:27,8",
                m: 1
              }
            ]
          },
          bust: {
            loop: true,
            w: 64,
            h: 64,
            ax: 32,
            ay: 63,
            frames: [
              { d: 700, l: "b_torso:0,0 b_head:0,0 ~b_face:0,0 +~b_over:0,0" },
              { d: 700, l: "b_torso:0,1 b_head:0,1 ~b_face:0,1 +~b_over:0,1" }
            ]
          }
        },
        label: "드라큘라",
        pal2: { w: "s", c: "s", x: "O", P: "A", q: "P", p: "C" }
      },
      shambler: {
        kind: "undead",
        w: 32,
        h: 32,
        ax: 16,
        ay: 31,
        pieces: {
          head: {
            x: 4,
            y: 1,
            r: [
              ".........w.........",
              ".....wwwwwiwww.....",
              "...wwwiiiyyiiiiw...",
              "..wwiiiiiiyiiiiiy..",
              ".wwiiiiiiiiiiiyiiy.",
              ".wiiiiiiiiiiiiiyiy.",
              "wwiiiiiiiiiiiiiiiyy",
              "wiiiiiiiiiiiiiiiiyy",
              "wiiiiiiiiiiiiiiiiyy",
              "wiiiiiiiiiiiiiiiiyy",
              "wiiiiiiiiiiiiiiiyyy",
              "wiiiiiiiiiiiiiiyyyy",
              "yiiiiiiiiiiiiiyyyy.",
              "y.iiiiiiiiiiiyyyy..",
              "...yiiiiiiiyyyyy...",
              "wiwiwiwiwyyyyyy....",
              "ywywywywyyyyy......",
              "yyyyyyyyy.........."
            ]
          },
          face_waiting: {
            x: 6,
            y: 7,
            r: ["..nn..", ".nnnn.", "nnnnnn", "nnddnn", "nndddn", ".nddn.", "..nn.."]
          },
          face_angry: {
            x: 6,
            y: 6,
            r: ["yyy...", "..yy..", ".nnnn.", "nnnnnn", "nnRRnn", "nnRRRn", ".nRRn.", "..nn.."]
          },
          face_leaving: {
            x: 6,
            y: 7,
            r: ["..nn..", ".nnnn.", "nnnnnn", "nnTTnn", "nnTTTn", ".nTTn.", "..nn.."]
          },
          face_satisfied: {
            x: 6,
            y: 10,
            r: [".nnn.", "n...n", ".....", "rrr..", "rrr.."]
          },
          face_hit: {
            x: 7,
            y: 9,
            r: ["n.n", ".n.", "n.n"]
          },
          face_restored: {
            x: 4,
            y: 8,
            r: ["..sssss...", ".sssssss..", "ssskkssskk", "ssswkssswk", "ssskkssskk", "sssssssss.", ".rrsssss..", ".rkkkks...", "..kRRk...."]
          },
          over_leaving: {
            x: 9,
            y: 0,
            r: ["..a..", ".aaa.", "aaaaa", "..a..", "..a.."]
          },
          over_satisfied: {
            x: 24,
            y: 3,
            r: [".G.", "GwG", ".G."]
          },
          over_angry: {
            x: 24,
            y: 4,
            r: ["R.R", ".R.", "R.R"]
          },
          torso: {
            x: 11,
            y: 19,
            r: ["ibbbbbbk", "bbBiBBBk", "ibBBBBBk", "bbBiBBBk", "ibBBBBBk", "dmdddbdn", "dmddbbdn", "BdBddBdn"]
          },
          armL_0: {
            x: 5,
            y: 21,
            r: [".......wy", ".w.wwwyyy", "wwwyyyy..", "www......", ".w......."],
            ol: "O"
          },
          armL_1: {
            x: 5,
            y: 21,
            r: ["wwwwwwwwy", "wwwyyyyyy", "www......"],
            ol: "O"
          },
          armL_up: {
            x: 4,
            y: 16,
            r: [".w........", "www.......", "wwwww.....", ".wyiiww...", "....yiiww.", "......yiiy", "........yy"],
            ol: "O"
          },
          armL_hit: {
            x: 7,
            y: 15,
            r: ["www....", "www....", "wwww...", "..wiw..", "...wiy.", "....wi.", ".....wy", "......y"],
            ol: "O"
          },
          armR_0: {
            x: 18,
            y: 21,
            r: ["i..", "ii.", "iyy", ".yy"]
          },
          armR_1: {
            x: 18,
            y: 21,
            r: ["i..", "ii.", "iyy", ".yy"]
          },
          armR_up: {
            x: 18,
            y: 21,
            r: ["ii.", "yyy"]
          },
          armR_hit: {
            x: 18,
            y: 21,
            r: ["i..", "ii.", "iyy", ".yy"]
          },
          legs_0: {
            x: 11,
            y: 27,
            r: ["..wiyiyy", "..wiyiyy", ".iiiyyyy", "wiiiiyyy"]
          },
          legs_a: {
            x: 9,
            y: 27,
            r: ["..wiy....iyy", "..wiy...yyyy", ".iiiy..yyyyy", "wiiii......."]
          },
          legs_b: {
            x: 10,
            y: 27,
            r: ["..iyywiy", "..iyiiiy", ".yywiiii", "yyyyy..."]
          },
          legs_p: {
            x: 12,
            y: 27,
            r: ["..wiyy", "..wiyy", ".iiiyy", "wiiii."]
          },
          b_head: {
            x: 5,
            y: 3,
            r: [
              "..........................wwwwwwwwww....................",
              "......................wwwwwwwwwwwwwwwwww................",
              "...................wwwwwwwwwiiiiiiiiiiwwwww.............",
              ".................wwwwwwwiiiiiiiiiiiiiyyiiiwww...........",
              "................wwwwwiiiiiiiiiiiiiiiiiyyiiiiiw..........",
              "..............wwwwwiiiiiiiiiiiiiiiiiiiiyiiiiiiiw........",
              ".............wwwwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiw.......",
              "............wwwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiy......",
              "...........wwwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiy.....",
              "..........wwwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyy....",
              "..........wwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiy....",
              ".........wwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyy...",
              "........wwwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyy..",
              "........wwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyy..",
              ".......wwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyy.",
              ".......wwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyiyiiiiiiyyy.",
              ".......wwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyiiiiiiiyyy.",
              ".......wwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyy.",
              "......wwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyy",
              "......wwwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyy",
              "......wwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyy",
              "......wwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyy",
              "......wwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyy",
              "......wwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyy",
              "......wwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyy",
              "......wwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyy",
              ".......wiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyy.",
              ".......wiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyy.",
              ".......wwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyyy.",
              "yy.....wwiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyyyy.",
              "yy......wiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyyy..",
              "yy......wiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyyyy..",
              ".........wiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyyyy...",
              "..........iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyyyy....",
              "..........wiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyyyyy....",
              "...........wiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyyyyyy.....",
              ".wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwiiiiiiiiiiyyyyyyyyy......",
              ".wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwiiiiiiiiyyyyyyyyyy.......",
              ".iyyiiiyyiiiyyiiiyyiiiyyiiiyyiiiiiiiyyyyyyyyyyyy........",
              ".iyyiiiyyiiiyyiiiyyiiiyyiiiyyiiiyyyyyyyyyyyyyy..........",
              ".iyyiiiyyiiiyyiiiyyiiiyyiiiyyiiyyyyyyyyyyyyyy...........",
              ".iyyiiiyyiiiyyiiiyyiiiyyiiiyyiiyyyyyyyyyyyy.............",
              ".iyyiiiyyiiiyyiiiyyiiiyyiiiyyiiyyyyyyyyy................",
              ".iyyiiiyyiiiyyiiiyyiiiyyiiiyyiiyyyyy....................",
              ".iyyiiiyyiiiyyiiiyyiiiyyiiiyyii.........................",
              ".yyyyyyyyyyyyyyyyyyyyyyyyyyyyyy.........................",
              ".yyyyyyyyyyyyyyyyyyyyyyyyyyyyyy.........................",
              ".yyyyyyyyyyyyyyyyyyyyyyyyyyyyyy........................."
            ],
            ol: "O"
          },
          b_torso: {
            x: 16,
            y: 44,
            r: [
              "....bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb......",
              "....bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBkk......",
              "...bbBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBkk.....",
              "...bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBkk.....",
              "...bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBkk.....",
              "...bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBkk....",
              "...bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBkk....",
              "..bbBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBkk....",
              "..bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBkkk...",
              "..bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBkk...",
              "..bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBkk...",
              "..bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBkk...",
              ".bbBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBkk..",
              ".bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBkk..",
              ".bBBBBBBBBiiBBBBiiBBBBiiBBBBiiBBBBiiBBBBBBkk..",
              ".bBBBBBBBBiiBBBBiiBBBBiiBBBBiiBBBBiiBBBBBBBkk.",
              ".bBBBBBBBBiiBBBBiiBBBBiiBBBBiiBBBBiiBBBBBBBkk.",
              "bbkkkkkkkkiikkkkiikkkkiikkkkiikkkkiikkkkkkkkk.",
              "bkkkkkkkkkiikkkkiikkkkiikkkkiikkkkiikkkkkkkkkk",
              "bkkkkkkkkkiikkkkiikkkkiikkkkiikkkkiikkkkkkkkkk"
            ],
            ol: "k"
          },
          b_face_waiting: {
            x: 14,
            y: 15,
            r: [
              "......nnnn......",
              "....nnnnnnnn....",
              "...nnnnnnnnnn...",
              "..nnnnnnnnnnnn..",
              ".nnnnnnnnnnnnnn.",
              ".nnnnnddddnnnnn.",
              ".nnnnnddddnnnnn.",
              "nnnnnnddddnnnnnn",
              "nnnnnndddddnnnnn",
              "nnnnnnddddddnnnn",
              "nnnnnddddddddnnn",
              "nnnnnddddddddnnn",
              "nnnnnddddddddnnn",
              ".nnnnddddddddnn.",
              ".nnnnddddddddnn.",
              ".nnnnddddddddnn.",
              "..nnnnddddddnn..",
              "...nnnnddddnn...",
              "....nnnnnnnn....",
              "......nnnn......"
            ]
          },
          b_face_angry: {
            x: 10,
            y: 14,
            r: [
              "yy..................",
              "yyyyy.....nnnn......",
              "yyyyyyyynnnnnnnn....",
              "yyyyyyyyyyyynnnnn...",
              "..yyyyyyyyyyyyynnn..",
              ".....nyyyyyyyyyyyyn.",
              ".....nnnnnyyyyyyyyyy",
              ".....nnnnnRRRRyyyyyy",
              "....nnnnnnRRRRnnnnyy",
              "....nnnnnnRRRRRnnnnn",
              "....nnnnnnRRRRRRnnnn",
              "....nnnnnRRRRRRRRnnn",
              "....nnnnnRRRRRRRRnnn",
              "....nnnnnRRRRRRRRnnn",
              ".....nnnnRRRRRRRRnn.",
              ".....nnnnRRRRRRRRnn.",
              ".....nnnnRRRRRRRRnn.",
              "......nnnnRRRRRRnn..",
              ".......nnnnRRRRnn...",
              "........nnnnnnnn....",
              "..........nnnn......"
            ]
          },
          b_face_leaving: {
            x: 14,
            y: 15,
            r: [
              "......nnnn......",
              "....nnnnnnnn....",
              "...nnnnnnnnnn...",
              "..nnnnnnnnnnnn..",
              ".nnnnnnnnnnnnnn.",
              ".nnnnnTTTTnnnnn.",
              ".nnnnnTTTTnnnnn.",
              "nnnnnnTTTTnnnnnn",
              "nnnnnnTTTTTnnnnn",
              "nnnnnnTTTTTTnnnn",
              "nnnnnTTTTTTTTnnn",
              "nnnnnTTTTTTTTnnn",
              "nnnnnTTTTTTTTnnn",
              ".nnnnTTTTTTTTnn.",
              ".nnnnTTTTTTTTnn.",
              ".nnnnTTTTTTTTnn.",
              "..nnnnTTTTTTnn..",
              "...nnnnTTTTnn...",
              "....nnnnnnnn....",
              "......nnnn......"
            ]
          },
          b_face_satisfied: {
            x: 14,
            y: 22,
            r: [
              ".....nnnnnn..",
              "....n......n.",
              "...n........n",
              ".............",
              ".............",
              ".............",
              ".............",
              ".............",
              ".............",
              ".............",
              ".............",
              ".............",
              ".rrrrrr......",
              "rrrrrrrr.....",
              "rrrrrrrr.....",
              ".rrrrrr......"
            ]
          },
          b_face_hit: {
            x: 17,
            y: 20,
            r: ["n.....n", ".n...n.", "..n.n..", "...n...", "..n.n..", ".n...n.", "n.....n"]
          },
          b_face_restored: {
            x: 11,
            y: 20,
            r: [
              ".........ssssssss.........",
              "......ssssssssssssss......",
              ".....ssssssssssssssss.....",
              "...ssssssssssssssssssss...",
              "...sskkkkssssssssskkkks...",
              "..sskwwkkkssssssskwwkkks..",
              ".ssskwwkkkssssssskwwkkkss.",
              ".ssskkkkkkssssssskkkkkkss.",
              "sssskOOOOkssssssskOOOOksss",
              "sssskOBBOkssssssskOBBOksss",
              "ssssskkkkssssssssskkkkssss",
              "ssssssssssssssssssssssssss",
              "ssssssssssssssssssssssssss",
              "ssssssssssssssssssssssssss",
              ".ssssssssssssssssssssssss.",
              ".rrrrssssssssssssssssssss.",
              "rrrrrrssssssssssssssssss..",
              "rrrrrrsssssssssssssssss...",
              ".rrrrssssssssssssssssss...",
              ".....kkkkkkkkssssssss.....",
              ".....kwwwwwwksssssss......",
              ".....kRRRRRRkssss.........",
              "......kRRRRk..............",
              ".......kkkk..............."
            ]
          },
          b_over_leaving: {
            x: 29,
            y: 0,
            r: ["...a...", "..aaa..", ".aaaaa.", "aaaaaaa", "...a...", "...a...", "...a..."]
          },
          b_over_satisfied: {
            x: 54,
            y: 4,
            r: ["..G..", "..G..", "GGwGG", "..G..", "..G.."]
          },
          b_over_angry: {
            x: 54,
            y: 6,
            r: ["R...R", ".R.R.", "..R..", ".R.R.", "R...R"]
          }
        },
        anims: {
          idle: {
            loop: true,
            frames: [
              { d: 420, l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0" },
              { d: 420, l: "legs_0:0,0 torso:0,0 armL_1:0,0 armR_1:0,0 head:0,1 ~face:0,1 +~over:0,1" }
            ]
          },
          walk: {
            loop: true,
            frames: [
              { d: 140, l: "legs_a:0,0 torso:0,0 armL_1:0,0 armR_1:0,0 head:0,0 ~face:0,0 +~over:0,0" },
              {
                d: 140,
                l: "legs_p:0,0 torso:0,-1 armL_0:0,-1 armR_0:0,-1 head:0,-1 ~face:0,-1 +~over:0,-1"
              },
              { d: 140, l: "legs_b:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0" },
              {
                d: 140,
                l: "legs_p:0,0 torso:0,-1 armL_0:0,-1 armR_0:0,-1 head:0,-1 ~face:0,-1 +~over:0,-1"
              }
            ]
          },
          attack: {
            loop: false,
            frames: [
              { d: 110, l: "legs_0:1,0 torso:1,0 armL_1:1,0 armR_1:1,0 head:1,1 face_angry:1,1" },
              { d: 90, l: "legs_a:-2,0 torso:-2,1 armL_up:-2,1 armR_up:-2,1 head:-2,1 face_angry:-2,1" },
              {
                d: 140,
                l: "legs_p:-1,0 torso:-1,0 armL_up:-1,0 armR_up:-1,0 head:-1,0 face_angry:-1,0"
              }
            ]
          },
          hit: {
            loop: false,
            frames: [
              { d: 200, l: "legs_0:1,0 torso:1,0 armL_hit:1,0 armR_hit:1,0 head:1,0 face_hit:1,0" }
            ]
          },
          mood: {
            loop: true,
            frames: [
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "waiting"
              },
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "angry"
              },
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "leaving"
              },
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "satisfied"
              }
            ]
          },
          restore: {
            loop: false,
            frames: [
              {
                d: 200,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,1 face_waiting:0,1",
                g: 1
              },
              {
                d: 150,
                l: "-tile/beam legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,1 face_waiting:0,1",
                g: 1
              },
              {
                d: 150,
                l: "-tile/beam legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 face_waiting:0,0",
                g: 0.75,
                h: 0.25
              },
              {
                d: 150,
                l: "-tile/beam legs_0:0,0 torso:0,-1 armL_1:0,-1 armR_1:0,-1 head:0,-1 face_leaving:0,-1 +fx/twk_s_g:3,6 +fx/twk_s_g:26,9",
                g: 0.45,
                m: 0.25,
                h: 0.5
              },
              {
                d: 110,
                l: "legs_0:0,0 torso:0,-2 armL_up:0,-2 armR_up:0,-2 head:0,-2 face_restored:0,-2 +fx/twk_m_g:2,4 +fx/twk_m_g:27,7 +fx/twk_s_g:14,1",
                g: 0.15,
                m: 0.6,
                h: 0.8,
                f: 0.55
              },
              {
                d: 110,
                l: "legs_0:0,0 torso:0,-3 armL_up:0,-3 armR_up:0,-3 head:0,-3 face_restored:0,-3 +fx/twk_l_g:2,5 +fx/twk_s_g:27,4 +fx/twk_s_g:8,1",
                g: 0,
                m: 1,
                h: 0.5,
                f: 0.2
              },
              {
                d: 120,
                l: "legs_0:0,0 torso:0,-1 armL_up:0,-1 armR_up:0,-1 head:0,-1 face_restored:0,-1 +fx/twk_s_g:3,8 +fx/twk_m_g:26,6",
                g: 0,
                m: 1,
                h: 0.25
              },
              {
                d: 260,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 face_restored:0,0 +fx/heart:24,3",
                g: 0,
                m: 1,
                h: 0
              }
            ]
          },
          audience: {
            loop: true,
            frames: [
              {
                d: 300,
                l: "torso:0,5 armL_0:0,5 armR_0:0,5 head:0,5 face_restored:0,5 tile/seat_front",
                m: 1
              },
              {
                d: 260,
                l: "torso:0,5 armL_up:0,5 armR_0:0,5 head:0,4 face_restored:0,4 tile/seat_front +fx/twk_s_g:3,6",
                m: 1
              },
              {
                d: 260,
                l: "torso:0,4 armL_up:0,4 armR_up:0,4 head:0,4 face_restored:0,4 tile/seat_front",
                m: 1
              },
              {
                d: 260,
                l: "torso:0,5 armL_0:0,5 armR_up:0,5 head:0,4 face_restored:0,4 tile/seat_front +fx/twk_s_g:26,8",
                m: 1
              }
            ]
          },
          bust: {
            loop: true,
            w: 64,
            h: 64,
            ax: 32,
            ay: 63,
            frames: [
              { d: 700, l: "b_torso:0,0 b_head:0,0 ~b_face:0,0 +~b_over:0,0" },
              { d: 700, l: "b_torso:0,1 b_head:0,1 ~b_face:0,1 +~b_over:0,1" }
            ]
          }
        },
        label: "셈블러",
        pal2: { w: "s", i: "s", y: "t", B: "A", b: "C", d: "P", m: "p" }
      },
      runner: {
        kind: "undead",
        w: 32,
        h: 32,
        ax: 16,
        ay: 31,
        pieces: {
          head: {
            x: 4,
            y: 2,
            r: [
              ".....nnnnndddd.....",
              "...nnnnnnnnnnnn....",
              "..nndmdPPnnnnnnn...",
              ".nddnnnpPnnnnnnnk..",
              ".nddnnnnnnnnnnnnkk.",
              "ndnnnnnnnnnnnnnnkk.",
              ".diiiiiiiynnnnnnkk.",
              ".iiiiiiiiinnnnnnkk.",
              "iiiiiiiiiiynnnnnkk.",
              "iiiiiiiiiiynnnnkkk.",
              "iiiiiiiiiiynnnnkPPP",
              "yiiiiiiiiyynnnkkpPP",
              ".iiiiiiiiynnkkkkPP.",
              ".iiiiiiiyykkkkkkPP.",
              "..yyiiyyykkkkk..pPP",
              ".....yy.kkk.....PPP"
            ]
          },
          face_waiting: {
            x: 6,
            y: 9,
            r: [".kk", ".kk", ".kk", ".kk", "...", "...", "...", "yyy"]
          },
          face_angry: {
            x: 5,
            y: 7,
            r: [".kk.", "..kk", "..kk", "..kk", "..kk", "..kR", "....", "....", "....", ".yyy", "y..."]
          },
          face_leaving: {
            x: 6,
            y: 9,
            r: [".kk", ".kk", ".kk", ".kT", "...", "...", "y.y", ".yy"]
          },
          face_satisfied: {
            x: 5,
            y: 10,
            r: ["..kk.", ".k..k", ".....", "rr...", "rr...", ".y..y", "..yy."]
          },
          face_hit: {
            x: 6,
            y: 9,
            r: [".k.k", "..k.", ".k.k", "....", "....", "....", "....", "kk.."]
          },
          face_restored: {
            x: 5,
            y: 9,
            r: ["..kk.", "..wk.", "..kk.", "..kn.", "rr...", "rr...", ".kkkk", ".kRRk"]
          },
          over_leaving: {
            x: 9,
            y: 0,
            r: ["..a..", ".aaa.", "aaaaa", "..a..", "..a.."]
          },
          over_satisfied: {
            x: 24,
            y: 3,
            r: [".G.", "GwG", ".G."]
          },
          over_angry: {
            x: 24,
            y: 4,
            r: ["R.R", ".R.", "R.R"]
          },
          torso: {
            x: 10,
            y: 19,
            r: ["gggggggg.", "abbbbbbBk", "abbbbbbBk", "abbbbbbbB", "abbbbbbbB", "abbbbbbbB", "bbbbbbbBB", "bBbBbBbBB"]
          },
          armL_0: {
            x: 5,
            y: 20,
            r: [".......GG.", ".....GGgoo", ".sGGGgooo.", "sssoooo...", "ssso......", ".s........"],
            ol: "O"
          },
          armL_1: {
            x: 5,
            y: 20,
            r: [".s...GGGG.", "sssGGgggoo", "sssoooooo.", ".s........"],
            ol: "O"
          },
          armL_up: {
            x: 4,
            y: 15,
            r: [".s.........", "sss........", "sssGG......", ".sGggGG....", "...ogggGG..", ".....ogggG.", ".......ogoo", ".........o."],
            ol: "O"
          },
          armL_hit: {
            x: 7,
            y: 14,
            r: [".s......", "sss.....", "sssG....", ".sggo...", "..Ggg...", "...GgG..", "....GgG.", ".....Goo", "......o."],
            ol: "O"
          },
          armR_0: {
            x: 17,
            y: 20,
            r: [".g...", "gog..", ".goo.", ".goo.", "..goo", "...o."]
          },
          armR_1: {
            x: 17,
            y: 20,
            r: [".g...", "gog..", ".goo.", ".goo.", "..goo", "...o."]
          },
          armR_up: {
            x: 17,
            y: 20,
            r: [".g...", "gogg.", ".oooo", "...o."]
          },
          armR_hit: {
            x: 17,
            y: 20,
            r: [".g...", "gog..", ".goo.", ".goo.", "..goo", "...o."]
          },
          legs_0: {
            x: 11,
            y: 27,
            r: ["..wi.iy", "..wi.iy", ".wwiiiy", "nkkkkkk"]
          },
          legs_a: {
            x: 9,
            y: 27,
            r: ["..wi.....iy", "..wi....iiy", ".wwi...kkkk", "nkkk......."]
          },
          legs_b: {
            x: 10,
            y: 27,
            r: ["..iy.wi", "..iywwi", ".iinkkk", "kkkk..."]
          },
          legs_p: {
            x: 12,
            y: 27,
            r: ["..wiy", "..wiy", ".wwik", "nkkk."]
          },
          b_head: {
            x: 10,
            y: 3,
            r: [
              ".............nnnnnnnnnnnnnnnnn....................",
              "...........nnnnnnnnnnnnnnnnnnnddd.................",
              "..........nnnnnddnnnnnnnnnnnnndddddd..............",
              "........nnnnnddnnnnnnnnnnnnnnnnnnnnddd............",
              "......nnnndddnnnnnnnnnnnnnnnnnnnnnnnnndd..........",
              ".....nnnddnnnnnnnnnnPPPnnnnnnnnnnnnnnnnnd.........",
              "...nnnddnnnnnnnnnnnnpPPnnnnnnnnnnnnnnnnnnn........",
              "..nndddnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnk.......",
              "..nnndnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnk......",
              "..nnndnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnkk.....",
              ".nnndnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnkk....",
              ".nndnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnkk....",
              ".nndnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnkkk...",
              ".ndnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnkk...",
              ".nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnkkk..",
              ".nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnkkk..",
              "nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnkkk..",
              "nnnnnnnnnnnnnnnnnnnnnniiynnnnnnnnnnnnnnnnnnnnkkkk.",
              "nnnnssiiiiiiinnnnnniiiiiiynnnnnnnnnnnnnnnnnnnkkkk.",
              "...ssiiiiiiiiiiiiiiiiiiiiyynnnnnnnnnnnnnnnnnnkkkk.",
              "...siiiiiiiiiiiiiiiiiiiiiiynnnnnnnnnnnnnnnnnnkkkk.",
              "..ssiiiiiiiiiiiiiiiiiiiiiiyynnnnnnnnnnnnnnnnkkkkk.",
              "..siiiiiiiiiiiiiiiiiiiiiiiyynnnnnnnnnnnnnnnnkkkkk.",
              ".ssiiiiiiiiiiiiiiiiiiiiiiiyyynnnnnnnnnnnnnnnkkkkk.",
              ".siiiiiiiiiiiiiiiiiiiiiiiiyyynnnnnnnnnnnnnnkkkkkk.",
              ".siiiiiiiiiiiiiiiiiiiiiiiiyyynnnnnnnnnnnnnnkkkkk..",
              ".siiiiiiiiiiiiiiiiiiiiiiiiyyynnnnnnnnnnnnnkkkkkk..",
              "ysiiiiiiiiiiiiiiiiiiiiiiiiyyynnnnnnnnnnnnnkkkkkk..",
              "ysiiiiiiiiiiiiiiiiiiiiiiiyyyynnnnnnnnnnnnkkkkkk...",
              ".siiiiiiiiiiiiiiiiiiiiiiiyyyynnnnnnnnnnnkkkkPPPP..",
              ".siiiiiiiiiiiiiiiiiiiiiiyyyyynnnnnnnnnnkkkkPPPPPP.",
              "..iiiiiiiiiiiiiiiiiiiiiiyyyynnnnnnnnnnkkkkPPPPPPPP",
              "..siiiiiiiiiiiiiiiiiiiiyyyyynnnnnnnnnkkkkkPPpPPPPP",
              "...iiiiiiiiiiiiiiiiiiiyyyyynnnnnnnnnkkkkkkPPPPPPPP",
              "...siiiiiiiiiiiiiiiiiyyyyyynnnnnnnkkkkkkkkPPPPPPPP",
              "....iiiiiiiiiiiiiiiiyyyyyynnnnnnkkkkkkkkkk.PPPPPP.",
              ".....yiiiiiiiiiiiiyyyyyyynnnnkkkkkkkkkkkk...PPPP..",
              "......yyiiiiiiiiyyyyyyyykkkkkkkkkkkkkkkk..........",
              ".......yyyyyyyyyyyyyyyykkkkkkkkkkkkkkk............",
              ".........yyyyyyyyyyyykkkkkkkkkkkkkkk..............",
              "...........yyyyyyyy....kkkkkkkkkk.................",
              "............................................PPPP..",
              "...........................................PPPPPP.",
              "..........................................PPPPPPPP",
              "..........................................PPpPPPPP",
              "..........................................PPPPPPPP",
              "..........................................PPPPPPPP",
              "...........................................PPPPPP.",
              "............................................PPPP.."
            ],
            ol: "k"
          },
          b_torso: {
            x: 12,
            y: 44,
            r: [
              "......bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb........",
              "......bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBkk.......",
              ".....bbBggggggggggggggggggBBBBBBBBBBBBBBBkk.......",
              ".....bBBgggggggggggggggggBBBBBBBBBBBBBBBBBk.......",
              ".....bBBggGGGGGGGGGGGGgggBBBBBBBBBBBBBBBBBkk......",
              "....bbBBggGGGGGGGGGGGGggBBBBBBBBBBBBBBBBBBkk......",
              "....bBBBggggggggggggggggBBBBBBBBBBBBBBBBBBBkk.....",
              "....bBBBgggggggggggggggBBBBBBBBBBBBBBBBBBBBkk.....",
              "...bbBBBgggggggggggggggBBBBBBBBBBBBBBBBBBBBBk.....",
              "...bBBBBggggggggggggggBBBBBBBBBBBBBBBBBBBBBBkk....",
              "...bBBBBggggggggggggggBBBBBBBBBBBBBBBBBBBBBBkk....",
              "...bBBBBgggggggggggggBBBBBBBBBBBBBBBBBBBBBBBBkk...",
              "..bbBBBBgggggggggggggBBBBBBBBBBBBBBBBBBBBBBBBkk...",
              "..bBBBBBggggggggggggBBBBBBBBBBBBBBBBBBBBBBBBBBk...",
              "..bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBkk..",
              ".bbBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBkk..",
              ".bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBkk.",
              ".bkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk.",
              "bbkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk.",
              "bkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk"
            ],
            ol: "k"
          },
          b_face_waiting: {
            x: 14,
            y: 24,
            r: ["....kkkk..", "...kwwkkk.", "...kwwkkk.", "...kwwkkk.", "...kwwkkk.", "..kkkkkkkk", "..kkkkkkkk", "...kkkkkk.", "...kkkkkk.", "...kkkkkk.", "...kkkkkk.", "....kkkk..", "..........", "..........", "..........", "..........", "..........", "..........", "yyyyy....."]
          },
          b_face_angry: {
            x: 12,
            y: 22,
            r: [
              "k...............",
              "kkkk............",
              "kkkkkkkkkk......",
              "..kkkkkkkkk.....",
              ".....kkkkkkk....",
              ".....kwwkkkkkkk.",
              ".....kwwkkkkkkkk",
              "....kkkkkkkk..kk",
              "....kkkRRkkk....",
              ".....kRRRRk.....",
              ".....kRRRRk.....",
              ".....kRRRRk.....",
              ".....kRRRRk.....",
              "......kRRk......",
              "................",
              "................",
              "................",
              "................",
              "................",
              "................",
              "..yyyyy.........",
              "..y............."
            ]
          },
          b_face_leaving: {
            x: 14,
            y: 24,
            r: ["....kkkk..", "...kwwkkk.", "...kwwkkk.", "...kwwkkk.", "...kwwkkk.", "..kkkkkkkk", "..kkkTTkkk", "...kTTTTk.", "...kTTTTk.", "...kTTTTk.", "...kTTTTk.", "....kTTk..", "..........", "..........", "..........", "..........", "..........", "y...y.....", ".yyy......"]
          },
          b_face_satisfied: {
            x: 10,
            y: 29,
            r: [".......kkkk.", "......k....k", "............", "............", "............", "............", ".rrrr.......", "rrrrrr......", "rrrrrr......", ".rrrr.......", "............", "............", "....y...y...", ".....yyy...."]
          },
          b_face_hit: {
            x: 14,
            y: 27,
            r: ["...k...k", "....k.k.", ".....k..", "....k.k.", "...k...k", "........", "........", "........", "........", "........", "........", "........", "........", "........", "........", "kk......"]
          },
          b_face_restored: {
            x: 10,
            y: 25,
            r: [
              "........kkkk.",
              ".......kwwkkk",
              ".......kwwkkk",
              ".......kkkkkk",
              ".......kOOOOk",
              ".......kOBBOk",
              "........kkkk.",
              ".............",
              ".............",
              ".............",
              ".rrrr........",
              "rrrrrr.......",
              "rrrrrr.......",
              ".rrrr........",
              ".............",
              ".............",
              "....kkkkkkkk.",
              "....kwwwwwwk.",
              "....kRRRRRRk.",
              ".....kRRRRk..",
              "......kkkk..."
            ]
          },
          b_over_leaving: {
            x: 29,
            y: 0,
            r: ["...a...", "..aaa..", ".aaaaa.", "aaaaaaa", "...a...", "...a...", "...a..."]
          },
          b_over_satisfied: {
            x: 54,
            y: 4,
            r: ["..G..", "..G..", "GGwGG", "..G..", "..G.."]
          },
          b_over_angry: {
            x: 54,
            y: 6,
            r: ["R...R", ".R.R.", "..R..", ".R.R.", "R...R"]
          }
        },
        anims: {
          idle: {
            loop: true,
            frames: [
              { d: 420, l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0" },
              { d: 420, l: "legs_0:0,0 torso:0,0 armL_1:0,0 armR_1:0,0 head:0,1 ~face:0,1 +~over:0,1" }
            ]
          },
          walk: {
            loop: true,
            frames: [
              { d: 140, l: "legs_a:0,0 torso:0,0 armL_1:0,0 armR_1:0,0 head:0,0 ~face:0,0 +~over:0,0" },
              {
                d: 140,
                l: "legs_p:0,0 torso:0,-1 armL_0:0,-1 armR_0:0,-1 head:0,-1 ~face:0,-1 +~over:0,-1"
              },
              { d: 140, l: "legs_b:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0" },
              {
                d: 140,
                l: "legs_p:0,0 torso:0,-1 armL_0:0,-1 armR_0:0,-1 head:0,-1 ~face:0,-1 +~over:0,-1"
              }
            ]
          },
          attack: {
            loop: false,
            frames: [
              { d: 110, l: "legs_0:1,0 torso:1,0 armL_1:1,0 armR_1:1,0 head:1,1 face_angry:1,1" },
              { d: 90, l: "legs_a:-2,0 torso:-2,1 armL_up:-2,1 armR_up:-2,1 head:-2,1 face_angry:-2,1" },
              {
                d: 140,
                l: "legs_p:-1,0 torso:-1,0 armL_up:-1,0 armR_up:-1,0 head:-1,0 face_angry:-1,0"
              }
            ]
          },
          hit: {
            loop: false,
            frames: [
              { d: 200, l: "legs_0:1,0 torso:1,0 armL_hit:1,0 armR_hit:1,0 head:1,0 face_hit:1,0" }
            ]
          },
          mood: {
            loop: true,
            frames: [
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "waiting"
              },
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "angry"
              },
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "leaving"
              },
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "satisfied"
              }
            ]
          },
          restore: {
            loop: false,
            frames: [
              {
                d: 200,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,1 face_waiting:0,1",
                g: 1
              },
              {
                d: 150,
                l: "-tile/beam legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,1 face_waiting:0,1",
                g: 1
              },
              {
                d: 150,
                l: "-tile/beam legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 face_waiting:0,0",
                g: 0.75,
                h: 0.25
              },
              {
                d: 150,
                l: "-tile/beam legs_0:0,0 torso:0,-1 armL_1:0,-1 armR_1:0,-1 head:0,-1 face_leaving:0,-1 +fx/twk_s_g:3,6 +fx/twk_s_g:26,9",
                g: 0.45,
                m: 0.25,
                h: 0.5
              },
              {
                d: 110,
                l: "legs_0:0,0 torso:0,-2 armL_up:0,-2 armR_up:0,-2 head:0,-2 face_restored:0,-2 +fx/twk_m_g:2,4 +fx/twk_m_g:27,7 +fx/twk_s_g:14,1",
                g: 0.15,
                m: 0.6,
                h: 0.8,
                f: 0.55
              },
              {
                d: 110,
                l: "legs_0:0,0 torso:0,-3 armL_up:0,-3 armR_up:0,-3 head:0,-3 face_restored:0,-3 +fx/twk_l_g:2,5 +fx/twk_s_g:27,4 +fx/twk_s_g:8,1",
                g: 0,
                m: 1,
                h: 0.5,
                f: 0.2
              },
              {
                d: 120,
                l: "legs_0:0,0 torso:0,-1 armL_up:0,-1 armR_up:0,-1 head:0,-1 face_restored:0,-1 +fx/twk_s_g:3,8 +fx/twk_m_g:26,6",
                g: 0,
                m: 1,
                h: 0.25
              },
              {
                d: 260,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 face_restored:0,0 +fx/heart:24,3",
                g: 0,
                m: 1,
                h: 0
              }
            ]
          },
          audience: {
            loop: true,
            frames: [
              {
                d: 300,
                l: "torso:0,5 armL_0:0,5 armR_0:0,5 head:0,5 face_restored:0,5 tile/seat_front",
                m: 1
              },
              {
                d: 260,
                l: "torso:0,5 armL_up:0,5 armR_0:0,5 head:0,4 face_restored:0,4 tile/seat_front +fx/twk_s_g:3,6",
                m: 1
              },
              {
                d: 260,
                l: "torso:0,4 armL_up:0,4 armR_up:0,4 head:0,4 face_restored:0,4 tile/seat_front",
                m: 1
              },
              {
                d: 260,
                l: "torso:0,5 armL_0:0,5 armR_up:0,5 head:0,4 face_restored:0,4 tile/seat_front +fx/twk_s_g:26,8",
                m: 1
              }
            ]
          },
          bust: {
            loop: true,
            w: 64,
            h: 64,
            ax: 32,
            ay: 63,
            frames: [
              { d: 700, l: "b_torso:0,0 b_head:0,0 ~b_face:0,0 +~b_over:0,0" },
              { d: 700, l: "b_torso:0,1 b_head:0,1 ~b_face:0,1 +~b_over:0,1" }
            ]
          }
        },
        label: "러너",
        pal2: { d: "O", n: "O", k: "O", P: "R", p: "r", b: "P", B: "q", a: "p", g: "a", G: "G" }
      },
      brute: {
        kind: "undead",
        w: 32,
        h: 32,
        ax: 16,
        ay: 31,
        pieces: {
          head: {
            x: 4,
            y: 2,
            r: [
              "......hhhhhhhh.....",
              "....hwwjjjjjjjjh...",
              "...wwwRiRjjjjjjjj..",
              "..wwiiiiiyjjjjjjjk.",
              ".wwiiiyiiiyjjjjjjkk",
              "wwiiiiiiiiyjjjjjjkk",
              "wiiiiiiiiikkkkyykkk",
              "wiiiiiiiiikkkkykkkk",
              "wiiiiiiiiiyyjjjjjkk",
              "wiyiiiiiiyyyjjjjkkk",
              "wiiiiiiiiyyyjjjjkkk",
              "wiRiiiiyyyyjjjjkkk.",
              ".iiRiiiyyyyjjkkkkk.",
              ".wiiiyyyyyjkkkkkk..",
              "..yyyyyyykkkkkk....",
              "....yyyykkkkk......"
            ]
          },
          face_waiting: {
            x: 6,
            y: 7,
            r: ["kkk", "kck", "kkk", ".k."]
          },
          face_angry: {
            x: 5,
            y: 5,
            r: ["kk..", ".kk.", ".kkk", ".kck", ".kkk", "..k."]
          },
          face_leaving: {
            x: 6,
            y: 7,
            r: ["kkk", "kck", "kkk", ".k."]
          },
          face_satisfied: {
            x: 5,
            y: 8,
            r: [".kkk.", "k...k", ".....", ".....", "rr...", "rr..."]
          },
          face_hit: {
            x: 6,
            y: 7,
            r: ["k.k", ".k.", "k.k"]
          },
          face_restored: {
            x: 4,
            y: 2,
            r: ["hhhhhhhhhhh", "hhhhhhhhhhh", "hhhhhhhhhhh", "iiiiiiiiiii", ".yyyyyyyyy.", "...........", "...sssss...", ".sssssssss.", ".skkssskkss", "sswkssswkss", "sskkssskkss", "srrssssssss", ".rrssssssss", ".sskkkksss.", "...kRRkss.."]
          },
          over_leaving: {
            x: 10,
            y: 0,
            r: ["..a..", ".aaa.", "aaaaa", "..a..", "..a.."]
          },
          over_satisfied: {
            x: 25,
            y: 2,
            r: [".G.", "GwG", ".G."]
          },
          over_angry: {
            x: 25,
            y: 3,
            r: ["R.R", ".R.", "R.R"]
          },
          torso: {
            x: 9,
            y: 18,
            r: ["ffhhhhhhhhhk", "fhhhhhhhhhhk", "fhhjhhhhhhhk", "fhhhhhhhhjhk", "hhhhhhjhhhhk", "hhhhhhhhhhhk", "hjhhhhhhhhjk", "hhhhjhhhhhhk", "jhjhhjhhjhjj"]
          },
          armL_0: {
            x: 3,
            y: 19,
            r: [".........f..", ".......ffhf.", "....fffhhhjj", ".wwihhhhhjj.", "iwwwihjjjj..", "iwwiijj.....", ".iiy........"],
            ol: "j"
          },
          armL_1: {
            x: 3,
            y: 19,
            r: [".........f..", ".wwifffffhf.", "iwwwihhhhhjj", "iwwiihhhhjj.", ".iiyjjjjjj.."],
            ol: "j"
          },
          armL_up: {
            x: 2,
            y: 15,
            r: [
              ".wwi.........",
              "iwwwi........",
              "iwwiiff......",
              ".iiyhhhff....",
              "...jhhhhhff..",
              ".....jhhhhhf.",
              ".......fhhhjj",
              "........jhjj.",
              "..........j.."
            ],
            ol: "j"
          },
          armL_hit: {
            x: 5,
            y: 13,
            r: [".wwi......", "iwwwi.....", "iwwii.....", ".iiyhf....", "..fhhhf...", "...fhhhj..", "....fhhh..", "....fhhhf.", ".....fhhjj", "......fjj.", ".......j.."],
            ol: "j"
          },
          armR_0: {
            x: 19,
            y: 20,
            r: ["hhh..", "hjjj.", "hjjj.", ".hjjj", "..hjj", "..jjj"]
          },
          armR_1: {
            x: 19,
            y: 20,
            r: ["hhh..", "hjjj.", "hjjj.", ".hjjj", "..hjj", "..jjj"]
          },
          armR_up: {
            x: 19,
            y: 20,
            r: ["hhh..", "hjjhj", "jjjjj", "..jjj"]
          },
          armR_hit: {
            x: 19,
            y: 20,
            r: ["hhh..", "hjjj.", "hjjj.", ".hjjj", "..hjj", "..jjj"]
          },
          legs_0: {
            x: 9,
            y: 27,
            r: ["..mddnnnn", "..mddnnnn", ".ddddnnnn", "nkkkkkkkk"]
          },
          legs_a: {
            x: 7,
            y: 27,
            r: [
              "..mddn...dnnn",
              "..mddn..nnnnn",
              ".ddddn.kkkkkk",
              "nkkkkk......."
            ]
          },
          legs_b: {
            x: 8,
            y: 27,
            r: ["..dnnmddn", "..dnddddn", ".nnnkkkkk", "kkkkkk..."]
          },
          legs_p: {
            x: 10,
            y: 27,
            r: ["..mddnn", "..mddnn", ".ddddnk", "nkkkkk."]
          },
          b_head: {
            x: 6,
            y: 4,
            r: [
              "...........................ffffffffff...................",
              ".............wwwwwwww...ffffffffffffffff................",
              "...........wwwwwwwwwwwwffffffhhhhhhhhhhffff.............",
              ".........wwwwwwiiiiiiiiwwfhhhhhhhhhhhhhhhhff............",
              "........wwwwwiiiRiRiRiiiiwhhhhhhhhhhhhhhhhhhhf..........",
              ".......wwwwiiiiiiyyiiiiiiiyhhhhhhhhhhhhhhhhhhhf.........",
              "......wwwwiiiiiiiyyiiiiiiiiyhhhhhhhhhhhhhhhhhhhj........",
              ".....wwwwiiiiiiiiiiiiiiiiiiyyhhhhhhhhhhhhhhhhhhhj.......",
              "....wwwwiiiiiiiiiiiiiiiiiiiiyyhhhhhhhhhhhhhhhhhhjj......",
              "....wwwiiiiiiiiiiiiiiiiiiiiiyyhhhhhhhhhhhhhhhhhhhjj.....",
              "...wwwiiiiiiiiiiiiiiiiiiiiiiiyyhhhhhhhhhhhhhhhhhhjj.....",
              "...wwwiiiiiiiiiiiiiiiiiiiiiiiyyhhhhhhhhhhhhhhhhhhjjj....",
              "..wwwiiiiiiiiiiiiiiiiiiiiiiiiyyyhhhhhhhhhhhhhhhhhhjj....",
              "..wwwiiiiiiiiiiiiiiiiiiiiiiiiyyyhhhhhhhhhhyyyyhhhhjjj...",
              ".wwwiiiiiiiiiiiiiiiiiiiiiiiiiiyykkkkkkkkkkykkykkkkkkkkkk",
              ".wwwiiiiiiiiiiiiiiiiiiiiiiiiiiyykkkkkkkkkkykkykkkkkkkkkk",
              ".wwiiiiiiiiiiiiiiiiiiiiiiiiiiiyykkkkkkkkkkykkykkkkkkkkkk",
              ".wwiiiiiiiiiiiiiiiiiiiiiiiiiiiyykkkkkkkkkkykkykkkkkkkkkk",
              "wwwiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyhhhhhhhhyyyyhhhhjjjj..",
              "wwwiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyhhhhhhhhhhhhhhhhjjjj..",
              "wwiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyhhhhhhhhhhhhhhhjjjjj..",
              "wwiiiyyiiiiiiiiiiiiiiiiiiiiiiiyyyyhhhhhhhhhhhhhhhjjjjj..",
              "wwiiiyyiiiiiiiiiiiiiiiiiiiiiiiyyyyhhhhhhhhhhhhhhhjjjjj..",
              "wwiiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyhhhhhhhhhhhhhhjjjjjj..",
              "wwiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyyhhhhhhhhhhhhhhjjjjj...",
              "wwiiiiiiiiiiiiiiiiiiiiiiiiiiiyyyyyhhhhhhhhhhhhhjjjjjj...",
              "wwiiRiiiiiiiiiiiiiiiiiiiiiiiiyyyyyhhhhhhhhhhhhhjjjjjj...",
              "wwiiiRiiiiiiiiiiiiiiiiiiiiiiiyyyyyhhhhhhhhhhhhjjjjjj....",
              ".wiiiiRiiiiiiiiiiiiiiiiiiiiiyyyyyhhhhhhhhhhhhjjjjjjj....",
              ".wiiiiiiiiiiiiiiiiiiiiiyyiiiyyyyyhhhhhhhhhhhjjjjjjj.....",
              ".wwiiiiiiiiiiiiiiiiiiiiyyiiyyyyyyhhhhhhhhhhjjjjjjjj.....",
              ".wwiiiiyyiiiiiiiiiiiiiiiiiiyyyyyyhhhhhhhhhjjjjjjjj......",
              "..wiiiiyyiiiiiiiiiiiiiiiiiyyyyyyhhhhhhhhjjjjjjjjj.......",
              "..wiiiiiiiiiiiiiiiiiiiiiiiyyyyyyhhhhhhhjjjjjjjjj........",
              "...wiiiiiiiiiiiiiiiiiiiiiyyyyyyhhhhhjjjjjjjjjjj.........",
              "...wiiiiiiiiiiiyyiiiiiiiyyyyyyyhhjjjjjjjjjjjjj..........",
              "....wiiiiiiiiiiyyiiiiiiyyyyyyyjjjjjjjjjjjjjj............",
              "....wiiiiiiiiiiiiiiiiiyyyyyyyyjjjjjjjjjjjjj.............",
              ".....wiiiiiiiiiiiiiiiyyyyyyyyjjjjjjjjjjj................",
              "......yiiiiiiiiiiiiyyyyyyyyyjjjjjjjjj...................",
              ".......yyiiiiiiiiyyyyyyyyyy.............................",
              "........yyyyyyyyyyyyyyyyyy..............................",
              ".........yyyyyyyyyyyyyyyy...............................",
              "...........yyyyyyyyyyyy.................................",
              ".............yyyyyyyy..................................."
            ],
            ol: "j"
          },
          b_torso: {
            x: 10,
            y: 44,
            r: [
              "......ffffffffffffffffffffffffffffffffffffffffff.....",
              "......fhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhjjj.....",
              ".....ffhhhhhhhhhhhhhjhhhhhhhhhhhhhhhhhhhhhhhhjjjj....",
              ".....fhhhhhhhhhhhhhhjhhhhhhhhhhhhhhhhhhhhhhhhhjjj....",
              ".....fhhhhhhhhhhhhhhjhhhhhhhhhhhhhhhhhhhhhhhhhjjj....",
              "....ffhhhhhhhhhhhhhhjhhhhhhhhhhhhhhhhhhhhhhhhhjjj....",
              "....fhhhhhhhhhhhhhhhjhhhhhhhhhhhhhhhhhhhhhhhhhjjjj...",
              "....fhhhhhhhhhhhhhhhjhhhhhhhhhhhhhhhhhhhhhhhhhhjjj...",
              "...ffhhhhhhhhhhhhhhhjhhhhhhhhhhhhhhhhhhhhhhhhhhjjj...",
              "...fhhhhhhhhhhhhhhhhjhhhhhhhhhhhhhhhhhhhhhhhhhhjjj...",
              "...fhhhhhhhhhhhhhhhhjhhhhhhhhhhhhhhhhhhhhhhhhhhjjjj..",
              "...fhhhhhhhhhhhhhhhhjhhhhhhhhhhhhhhhhhhhhhhhhhhhjjj..",
              "..ffhhhhhhhhhhhhhhhhjhhhhhhhhhhhhhhhhhhhhhhhhhhhjjj..",
              "..fhhhhhhhhhhhhhhhhhjhhhhhhhhhhhhhhhhhhhhhhhhhhhjjj..",
              "..fhhhhhhhhhhhhhhhhhjhhhhhhhhhhhhhhhhhhhhhhhhhhhjjjj.",
              ".ffhhhhhhhhhhhhhhhhhjhhhhhhhhhhhhhhhhhhhhhhhhhhhhjjj.",
              ".fhhhhhhhhhhhhhhhhhhjhhhhhhhhhhhhhhhhhhhhhhhhhhhhjjj.",
              ".fjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj.",
              "ffjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj",
              "fjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj"
            ],
            ol: "j"
          },
          b_face_waiting: {
            x: 12,
            y: 19,
            r: ["...kkkkkk...", "..kkkkkkkk..", ".kkkkkkkkkk.", ".kkkkwkkkkk.", "kkkkkkkkkkkk", "kkkkkknnkkkk", "kkkkknnnnkkk", "kkkknnnnnnkk", "kkkknnnnnnkk", "kkkknnnnnnkk", ".kkknnnnnnk.", ".kkkknnnnkk.", "..kkkknnkk..", "...kkkkkk..."]
          },
          b_face_angry: {
            x: 8,
            y: 16,
            r: [
              "k.................",
              "kkkk..............",
              "kkkkkkk...........",
              "kkkkkkkkkkkkk.....",
              "..kkkkkkkkkkkk....",
              ".....kkkkkkkkkkk..",
              ".....kkkkkkkkkkkkk",
              "....kkkkkkkkkkkkkk",
              "....kkkkkkRRkkkkkk",
              "....kkkkkRRRRkkk..",
              "....kkkkRRRRRRkk..",
              "....kkkkRRRRRRkk..",
              "....kkkkRRRRRRkk..",
              ".....kkkRRRRRRk...",
              ".....kkkkRRRRkk...",
              "......kkkkRRkk....",
              ".......kkkkkk....."
            ]
          },
          b_face_leaving: {
            x: 12,
            y: 19,
            r: ["...kkkkkk...", "..kkkkkkkk..", ".kkkkkkkkkk.", ".kkkkwkkkkk.", "kkkkkkkkkkkk", "kkkkkkTTkkkk", "kkkkkTTTTkkk", "kkkkTTTTTTkk", "kkkkTTTTTTkk", "kkkkTTTTTTkk", ".kkkTTTTTTk.", ".kkkkTTTTkk.", "..kkkkTTkk..", "...kkkkkk..."]
          },
          b_face_satisfied: {
            x: 13,
            y: 26,
            r: ["..kkkkk..", ".k.....k.", "k.......k"]
          },
          b_face_hit: {
            x: 15,
            y: 23,
            r: ["k...k", ".k.k.", "..k..", ".k.k.", "k...k"]
          },
          b_face_restored: {
            x: 6,
            y: 8,
            r: [
              "hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh",
              "hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh",
              "hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh",
              "hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh",
              "hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh",
              "hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh",
              "hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh",
              "hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh",
              "hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh",
              "iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii",
              "iiiiiiyiiiiiiiyiiiiiiiyiiiiiiiyiiiiiii",
              "iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii",
              "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",
              "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",
              "........ssssssssssssssssssss..........",
              ".......ssssssssssssssssssssss.........",
              "......ssssssssssssssssssssssss........",
              "......ssssssssssssssssssssssss........",
              ".....sssssskkkksssssssssskkkkss.......",
              ".....ssssskwwkkksssssssskwwkkks.......",
              "....sssssskwwkkksssssssskwwkkkss......",
              "....sssssskkkkkksssssssskkkkkkss......",
              "....sssssskOOOOksssssssskOOOOkss......",
              "....sssssskOBBOksssssssskOBBOkss......",
              "....ssssssskkkksssssssssskkkksss......",
              "....ssssssssssssssssssssssssssss......",
              ".....ssssssssssssssssssssssssss.......",
              ".....srrrrsssssssssssssssssssss.......",
              ".....rrrrrrsssssssssssssssssss........",
              ".....rrrrrrsssssssssssssssssss........",
              "......rrrrsssssssssssssssssss.........",
              "........ssssssssssssssssssss..........",
              ".........sskkkkkkkkssssssss...........",
              "...........kwwwwwwkssssss.............",
              "...........kRRRRRRksss................",
              "............kRRRRk....................",
              ".............kkkk....................."
            ]
          },
          b_over_leaving: {
            x: 29,
            y: 0,
            r: ["...a...", "..aaa..", ".aaaaa.", "aaaaaaa", "...a...", "...a...", "...a..."]
          },
          b_over_satisfied: {
            x: 54,
            y: 4,
            r: ["..G..", "..G..", "GGwGG", "..G..", "..G.."]
          },
          b_over_angry: {
            x: 54,
            y: 6,
            r: ["R...R", ".R.R.", "..R..", ".R.R.", "R...R"]
          }
        },
        anims: {
          idle: {
            loop: true,
            frames: [
              { d: 420, l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0" },
              { d: 420, l: "legs_0:0,0 torso:0,0 armL_1:0,0 armR_1:0,0 head:0,1 ~face:0,1 +~over:0,1" }
            ]
          },
          walk: {
            loop: true,
            frames: [
              { d: 140, l: "legs_a:0,0 torso:0,0 armL_1:0,0 armR_1:0,0 head:0,0 ~face:0,0 +~over:0,0" },
              {
                d: 140,
                l: "legs_p:0,0 torso:0,-1 armL_0:0,-1 armR_0:0,-1 head:0,-1 ~face:0,-1 +~over:0,-1"
              },
              { d: 140, l: "legs_b:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0" },
              {
                d: 140,
                l: "legs_p:0,0 torso:0,-1 armL_0:0,-1 armR_0:0,-1 head:0,-1 ~face:0,-1 +~over:0,-1"
              }
            ]
          },
          attack: {
            loop: false,
            frames: [
              { d: 110, l: "legs_0:1,0 torso:1,0 armL_1:1,0 armR_1:1,0 head:1,1 face_angry:1,1" },
              { d: 90, l: "legs_a:-2,0 torso:-2,1 armL_up:-2,1 armR_up:-2,1 head:-2,1 face_angry:-2,1" },
              {
                d: 140,
                l: "legs_p:-1,0 torso:-1,0 armL_up:-1,0 armR_up:-1,0 head:-1,0 face_angry:-1,0"
              }
            ]
          },
          hit: {
            loop: false,
            frames: [
              { d: 200, l: "legs_0:1,0 torso:1,0 armL_hit:1,0 armR_hit:1,0 head:1,0 face_hit:1,0" }
            ]
          },
          mood: {
            loop: true,
            frames: [
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "waiting"
              },
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "angry"
              },
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "leaving"
              },
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "satisfied"
              }
            ]
          },
          restore: {
            loop: false,
            frames: [
              {
                d: 200,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,1 face_waiting:0,1",
                g: 1
              },
              {
                d: 150,
                l: "-tile/beam legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,1 face_waiting:0,1",
                g: 1
              },
              {
                d: 150,
                l: "-tile/beam legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 face_waiting:0,0",
                g: 0.75,
                h: 0.25
              },
              {
                d: 150,
                l: "-tile/beam legs_0:0,0 torso:0,-1 armL_1:0,-1 armR_1:0,-1 head:0,-1 face_leaving:0,-1 +fx/twk_s_g:3,6 +fx/twk_s_g:26,9",
                g: 0.45,
                m: 0.25,
                h: 0.5
              },
              {
                d: 110,
                l: "legs_0:0,0 torso:0,-2 armL_up:0,-2 armR_up:0,-2 head:0,-2 face_restored:0,-2 +fx/twk_m_g:2,4 +fx/twk_m_g:27,7 +fx/twk_s_g:14,1",
                g: 0.15,
                m: 0.6,
                h: 0.8,
                f: 0.55
              },
              {
                d: 110,
                l: "legs_0:0,0 torso:0,-3 armL_up:0,-3 armR_up:0,-3 head:0,-3 face_restored:0,-3 +fx/twk_l_g:2,5 +fx/twk_s_g:27,4 +fx/twk_s_g:8,1",
                g: 0,
                m: 1,
                h: 0.5,
                f: 0.2
              },
              {
                d: 120,
                l: "legs_0:0,0 torso:0,-1 armL_up:0,-1 armR_up:0,-1 head:0,-1 face_restored:0,-1 +fx/twk_s_g:3,8 +fx/twk_m_g:26,6",
                g: 0,
                m: 1,
                h: 0.25
              },
              {
                d: 260,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 face_restored:0,0 +fx/heart:24,3",
                g: 0,
                m: 1,
                h: 0
              }
            ]
          },
          audience: {
            loop: true,
            frames: [
              {
                d: 300,
                l: "torso:0,5 armL_0:0,5 armR_0:0,5 head:0,5 face_restored:0,5 tile/seat_front",
                m: 1
              },
              {
                d: 260,
                l: "torso:0,5 armL_up:0,5 armR_0:0,5 head:0,4 face_restored:0,4 tile/seat_front +fx/twk_s_g:3,6",
                m: 1
              },
              {
                d: 260,
                l: "torso:0,4 armL_up:0,4 armR_up:0,4 head:0,4 face_restored:0,4 tile/seat_front",
                m: 1
              },
              {
                d: 260,
                l: "torso:0,5 armL_0:0,5 armR_up:0,5 head:0,4 face_restored:0,4 tile/seat_front +fx/twk_s_g:27,8",
                m: 1
              }
            ]
          },
          bust: {
            loop: true,
            w: 64,
            h: 64,
            ax: 32,
            ay: 63,
            frames: [
              { d: 700, l: "b_torso:0,0 b_head:0,0 ~b_face:0,0 +~b_over:0,0" },
              { d: 700, l: "b_torso:0,1 b_head:0,1 ~b_face:0,1 +~b_over:0,1" }
            ]
          }
        },
        label: "브루트",
        pal2: { f: "e", h: "f", j: "h", w: "s", i: "s", y: "t", m: "A", d: "P", n: "q" }
      },
      elite: {
        kind: "undead",
        w: 32,
        h: 32,
        ax: 16,
        ay: 31,
        pieces: {
          head: {
            x: 4,
            y: 2,
            r: [
              "BBBBBBBBBBBBBBBBBB..",
              "OOOOOOOOOOOOOOOOOO..",
              "OOOOOOOOOOOOOOOOOO..",
              "OOkOOkOOkOOkOOkOOk..",
              "OOeOfOfffffjfjffhe..",
              "eOfOffffffffjjffhh..",
              "efffffffffffffffhh.l",
              "efffffffffffffffhhll",
              "effffffffffffffffhlA",
              "efffffffffffffffhh..",
              "efffffffffffffffhh..",
              "efffffffffffffffhh..",
              "yyffffffffffffffhh..",
              "efffffffffffffhhhh..",
              "efffffffffffffhhhh..",
              "..hhhhhhhhhhhhhh....",
              "..ehhhhhhhhhhhhh...."
            ]
          },
          face_waiting: {
            x: 5,
            y: 8,
            r: ["jjjj..", ".www..", ".kkw..", ".kkw..", "......", "......", "......", "jjjjjj"]
          },
          face_angry: {
            x: 4,
            y: 7,
            r: ["..jjj..", ".jjjj..", "..www..", "..RRw..", "..RRw..", ".......", ".......", ".......", ".jjjjjj", "j......"]
          },
          face_leaving: {
            x: 5,
            y: 8,
            r: ["jjjj..", ".www..", ".TTw..", ".TTw..", "......", "......", "j....j", ".jjjj."]
          },
          face_satisfied: {
            x: 5,
            y: 10,
            r: ["..jj.", ".j..j", ".....", "rr...", "jr.j.", ".jj.."]
          },
          face_hit: {
            x: 6,
            y: 9,
            r: ["j.j", ".j.", "j.j", "...", "...", "...", "kk.", "kk."]
          },
          face_restored: {
            x: 5,
            y: 9,
            r: [".kk...kk", ".wk...wk", ".kk...kk", "........", "rr......", "rr......", ".kkkk...", ".kRRk..."]
          },
          over_leaving: {
            x: 9,
            y: 0,
            r: ["..a..", ".aaa.", "aaaaa", "..a..", "..a.."]
          },
          over_satisfied: {
            x: 25,
            y: 2,
            r: [".G.", "GwG", ".G."]
          },
          over_angry: {
            x: 25,
            y: 3,
            r: ["R.R", ".R.", "R.R"]
          },
          torso: {
            x: 10,
            y: 19,
            r: ["mdddddddn", "mdiddddnn", "mddddddnn", "mdddjdddn", "mddddddnn", "mddddddnn", "BBBBBBBBB", "BBBBBBBBB"]
          },
          armL_0: {
            x: 4,
            y: 20,
            r: ["........mn", ".....mmmdn", ".fmmmdnnnn", "fffnnnn...", "fefn......", ".f........"],
            ol: "k"
          },
          armL_1: {
            x: 4,
            y: 20,
            r: [".f..mmmmmn", "fffmdddddn", "fefnnnnnnn", ".f........"],
            ol: "k"
          },
          armL_up: {
            x: 3,
            y: 15,
            r: [".f.........", "fff........", "fefmm......", ".fmddmm....", "...ndddmm..", ".....ndddmn", ".......nddn", ".........nn"],
            ol: "k"
          },
          armL_hit: {
            x: 6,
            y: 13,
            r: [".f......", "fff.....", "fefm....", ".fddn...", "..mdd...", "...mdm..", "....mdm.", "....mddn", ".....mdn", "......nn"],
            ol: "k"
          },
          armR_0: {
            x: 17,
            y: 20,
            r: [".d...", "dnd..", ".dnn.", ".dnn.", "..dnn", "...n."]
          },
          armR_1: {
            x: 17,
            y: 20,
            r: [".d...", "dnd..", ".dnn.", ".dnn.", "..dnn", "...n."]
          },
          armR_up: {
            x: 17,
            y: 20,
            r: [".d...", "dndd.", ".nnnn", "...n."]
          },
          armR_hit: {
            x: 17,
            y: 20,
            r: [".d...", "dnd..", ".dnn.", ".dnn.", "..dnn", "...n."]
          },
          legs_0: {
            x: 10,
            y: 26,
            r: ["..bBOBOO", "..bBOBOO", "..bBOBOO", ".BBBOOOO", "nkkkkkkk"]
          },
          legs_a: {
            x: 8,
            y: 26,
            r: ["..bBO....BOO", "..bBO....BOO", "..bBO...OOOO", ".BBBO..kkkkk", "nkkkk......."]
          },
          legs_b: {
            x: 9,
            y: 26,
            r: ["..BOObBO", "..BOObBO", "..BOBBBO", ".OOnkkkk", "kkkkk..."]
          },
          legs_p: {
            x: 11,
            y: 26,
            r: ["..bBOO", "..bBOO", "..bBOO", ".BBBOk", "nkkkk."]
          },
          b_head: {
            x: 8,
            y: 3,
            r: [
              "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB....",
              "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB....",
              "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO....",
              "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO....",
              "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO....",
              "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO....",
              "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO....",
              "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO....",
              "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO....",
              "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOjOjOjOOOOOOOOOOOOOOO....",
              "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOjOjOOOOOOOOOOOOOOOO....",
              "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO....",
              "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO....",
              "..OOkkkOOkkkOOkkkOOkkkOOkkkOOkkkOOkkkOOkkkOOkkhee.......",
              "..OOkkkOOkkkOOkkkOOkkkOOkkkOOkkkOOkkkOOkkkOOkkhee.......",
              "..OOfffOOfffOOfffOOfffOOfffOOfffOOfffOOfffOOfhhhh.......",
              "..OOfffOOfffOOfffOOfffOOfffOOfffOOfffOOfffOOfhhhh.......",
              "..eefffffffffffffffffffffffffffffffffffffffffhffffff....",
              "..eefffffffffffffffffffffffffffffffffffffffffhffffff....",
              "..eefffffffffffffffffffffffffffffffffffffffffhffffff....",
              "..eefffffffffffffffffffffffffffffffffffffffffhffffff....",
              "..eefffffffffffffffffffffffffffffffffffffffffhhhh...ll..",
              "..eefffffffffffffffffffffffffffffffffffffffffhhhh...ll..",
              "..eefffffffffffffffffffffffffffffffffffffffffhhfwwwwwwwA",
              "..eefffffffffffffffffffffffffffffffffffffffffhffllllllAA",
              "..eeffffffffffffffffffffffffffffffffffffffffffffllllllAA",
              "..eeffffffffffffffffffffffffffffffffffffffffffffllllllAA",
              "..eefffffffffffffffffffffffffffffffffffffffffffffff.ll..",
              "..eefffffffffffffffffffffffffffffffffffffffffffffff.ll..",
              "..eefffffffffffffffffffffffffffffffffffffffffhffff......",
              "..eefffffffffffffffffffffffffffffffffffffffffhhff.......",
              "..eefffffffffffffffffffffffffffffffffffffffffhhhh.......",
              "..eefffffffffffffffffffffffffffffffffffffffffhhhh.......",
              "..eefffffffffffffffffffffffffffffffffffffffffhhhh.......",
              "..eefffffffffffffffffffffffffffffffffffffffffhhhh.......",
              ".yyefffffffffffffffffffffffffffffffffffffffffhhhh.......",
              ".yyefffffffffffffffffffffffffffffffffffffffffhhhh.......",
              "..eefffffffffffffffffffffffffffffffffffffffffhhhh.......",
              "..eefffffffffffffffffffffffffffffffffffffffffhhhh.......",
              "..eefffffffffffffffffffffffffffffffffffffffffhhhh.......",
              "..eefffffffffffffffffffffffffffffffffffffhhhhhhhh.......",
              "..eefffffffffffffffffffffffffffffffffffffhhhhhhhh.......",
              "..eefffffffffffffffffffffffffffffffffffffhhhhhhhh.......",
              "..eefffffffffffffffffffffffffffffffffffffhhhhhhhh.......",
              "......hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh...........",
              "......hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh...........",
              "......eehhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh...........",
              "......eehhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh..........."
            ],
            ol: "k"
          },
          b_torso: {
            x: 6,
            y: 44,
            r: [
              "....mmmmmmmmmmmmwwwwwwwwmmmmmmmmmmmmmmmmmmmmmmmmmmmm.....",
              "....mdddddddddddwwwwwwwwdddddddddddddddddddddddddnnn.....",
              "...mmdddddddddddwwwwwwwwdddddddddddddddddddddddddnnnn....",
              "...mddddddddddddwwwwwwwwddddddddddddddddddddddddddnnn....",
              "...mddddddddddddwwwwwwwwddddddddddddddddddddddddddnnn....",
              "...mddddddddddddwwwwwwwwddddddddddddddddddddddddddnnn....",
              "...mddddddddddddiiiiiiiiddddddddddddddddddddddddddnnnn...",
              "..mmddddddddddddiiiiiiiidddddddddddddddddddddddddddnnn...",
              "..mdddddddddddddwiiiiiiwdddddddddddddddddddddddddddnnn...",
              "..mdddddddddddddwiiiiiiwdddddddddddddddddddddddddddnnn...",
              "..mdddddddddddddwiiiiiiwdddddddddddddddddddddddddddnnnn..",
              "..mdddddddddddddwwiiiiwwddddddddddddddddddddddddddddnnn..",
              ".mmdddddddddddddwwiiiiwwddddddddddddddddddddddddddddnnn..",
              ".mddddddddddddddwwiiiiwwddddddddddddddddddddddddddddnnn..",
              ".mddddddddddddddwwiiiiwwddddddddddddddddddddddddddddnnnn.",
              ".mddddddddddddddwwwiiwwwdddddddddddddddddddddddddddddnnn.",
              ".mddddddddddddddwwwiiwwwdddddddddddddddddddddddddddddnnn.",
              "mmnnnnnnnnnnnnnnwwwiiwwwnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn.",
              "mnnnnnnnnnnnnnnnwwwwwwwwnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn",
              "mnnnnnnnnnnnnnnnwwwwwwwwnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn"
            ],
            ol: "k"
          },
          b_face_waiting: {
            x: 14,
            y: 24,
            r: [
              "..jjjjjjjjjjjjjj",
              "..jjjjjjjjjjjjjj",
              "..jjjjjjjjjjjjjj",
              ".......ww.......",
              "...kkwwwwwwkkk..",
              "...kwwwwwwwwkk..",
              "...kwwwwwwwwkk..",
              "...wwkwwwwwwwk..",
              "...wwwwwwwwwwk..",
              "...kwwwwwwwwkk..",
              "...kwwwwwwwwkk..",
              "...kkwwwwwwkkk..",
              "...kkkkwwkkkkk..",
              "................",
              "................",
              "................",
              "................",
              "................",
              "................",
              "................",
              "jjjjjjjj........"
            ]
          },
          b_face_angry: {
            x: 14,
            y: 22,
            r: [
              "j.................",
              "jjjj..............",
              "jjjjjjjjjjjjjjjj..",
              ".jjjjjjjjjjjjjjj..",
              "..jjjjjjjjjjjjjj..",
              ".......jjjjjjjjj..",
              "...kkRRRRRjjjjjjjj",
              "...kRwwRRRRRkjjjjj",
              "...kRwwRRRRRkk..jj",
              "...RRRRRRRRRRk....",
              "...RRRRRRRRRRk....",
              "...kRRRRRRRRkk....",
              "...kRRRRRRRRkk....",
              "...kkRRRRRRkkk....",
              "...kkkkRRkkkkk....",
              "..................",
              "..................",
              "..................",
              "..................",
              "..................",
              "..................",
              "..................",
              "jjjjjjjj..........",
              "j................."
            ]
          },
          b_face_leaving: {
            x: 14,
            y: 24,
            r: [
              "..jjjjjjjjjjjjjj",
              "..jjjjjjjjjjjjjj",
              "..jjjjjjjjjjjjjj",
              ".......TT.......",
              "...kkTTTTTTkkk..",
              "...kTwwTTTTTkk..",
              "...kTwwTTTTTkk..",
              "...TTTTTTTTTTk..",
              "...TTTTTTTTTTk..",
              "...kTTTTTTTTkk..",
              "...kTTTTTTTTkk..",
              "...kkTTTTTTkkk..",
              "...kkkkTTkkkkk..",
              "................",
              "................",
              "................",
              "................",
              "................",
              "................",
              "j......j........",
              ".jjjjjj........."
            ]
          },
          b_face_satisfied: {
            x: 14,
            y: 27,
            r: ["....jjjjj..", "...j.....j.", "..j.......j", "...........", "...........", "...........", "...........", "...........", "...........", "...........", "..rrrr.....", ".rrrrrr....", ".rrrrrr....", "..rrrr.....", "...........", "...........", "j......j...", ".jjjjjj...."]
          },
          b_face_hit: {
            x: 17,
            y: 26,
            r: ["j....j", ".j..j.", "..jj..", "..jj..", ".j..j.", "j....j", "......", "......", "......", "......", "......", "......", "......", "......", "......", "......", "......", "......", "...kkk", "...kkk"]
          },
          b_face_restored: {
            x: 13,
            y: 23,
            r: [
              ".ssssssssssssssssssssssssss",
              ".ssssssssssssssssssssssssss",
              ".ssssssssssssssssssssssssss",
              ".ssssssssssssssssssssssssss",
              ".ssskkkksssssssssskkkksssss",
              ".sskwwkkksssssssskwwkkkssss",
              ".sskwwkkksssssssskwwkkkssss",
              ".sskkkkkksssssssskkkkkkssss",
              ".sskOOOOksssssssskOOOOkssss",
              ".sskOBBOksssssssskOBBOkssss",
              ".ssskkkksssssssssskkkksssss",
              ".ssssssssssssssssssssssssss",
              ".ssssssssssssssssssssssssss",
              ".ssssssssssssssssssssssssss",
              ".rrrrssssssssssssssssssssss",
              "rrrrrrsssssssssssssssssssss",
              "rrrrrrsssssssssssssssssssss",
              ".rrrrssssssssssssssssssssss",
              ".sssskkkkkkkkssssssssssssss",
              ".sssskwwwwwwkssssssssssssss",
              ".sssskRRRRRRkssssssssssssss",
              ".ssssskRRRRksssssssssssssss",
              ".......kkkk................"
            ]
          },
          b_over_leaving: {
            x: 29,
            y: 0,
            r: ["...a...", "..aaa..", ".aaaaa.", "aaaaaaa", "...a...", "...a...", "...a..."]
          },
          b_over_satisfied: {
            x: 54,
            y: 4,
            r: ["..G..", "..G..", "GGwGG", "..G..", "..G.."]
          },
          b_over_angry: {
            x: 54,
            y: 6,
            r: ["R...R", ".R.R.", "..R..", ".R.R.", "R...R"]
          }
        },
        anims: {
          idle: {
            loop: true,
            frames: [
              { d: 420, l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0" },
              { d: 420, l: "legs_0:0,0 torso:0,0 armL_1:0,0 armR_1:0,0 head:0,1 ~face:0,1 +~over:0,1" }
            ]
          },
          walk: {
            loop: true,
            frames: [
              { d: 140, l: "legs_a:0,0 torso:0,0 armL_1:0,0 armR_1:0,0 head:0,0 ~face:0,0 +~over:0,0" },
              {
                d: 140,
                l: "legs_p:0,0 torso:0,-1 armL_0:0,-1 armR_0:0,-1 head:0,-1 ~face:0,-1 +~over:0,-1"
              },
              { d: 140, l: "legs_b:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0" },
              {
                d: 140,
                l: "legs_p:0,0 torso:0,-1 armL_0:0,-1 armR_0:0,-1 head:0,-1 ~face:0,-1 +~over:0,-1"
              }
            ]
          },
          attack: {
            loop: false,
            frames: [
              { d: 110, l: "legs_0:1,0 torso:1,0 armL_1:1,0 armR_1:1,0 head:1,1 face_angry:1,1" },
              { d: 90, l: "legs_a:-2,0 torso:-2,1 armL_up:-2,1 armR_up:-2,1 head:-2,1 face_angry:-2,1" },
              {
                d: 140,
                l: "legs_p:-1,0 torso:-1,0 armL_up:-1,0 armR_up:-1,0 head:-1,0 face_angry:-1,0"
              }
            ]
          },
          hit: {
            loop: false,
            frames: [
              { d: 200, l: "legs_0:1,0 torso:1,0 armL_hit:1,0 armR_hit:1,0 head:1,0 face_hit:1,0" }
            ]
          },
          mood: {
            loop: true,
            frames: [
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "waiting"
              },
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "angry"
              },
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "leaving"
              },
              {
                d: 600,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 ~face:0,0 +~over:0,0",
                mo: "satisfied"
              }
            ]
          },
          restore: {
            loop: false,
            frames: [
              {
                d: 200,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,1 face_waiting:0,1",
                g: 1
              },
              {
                d: 150,
                l: "-tile/beam legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,1 face_waiting:0,1",
                g: 1
              },
              {
                d: 150,
                l: "-tile/beam legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 face_waiting:0,0",
                g: 0.75,
                h: 0.25
              },
              {
                d: 150,
                l: "-tile/beam legs_0:0,0 torso:0,-1 armL_1:0,-1 armR_1:0,-1 head:0,-1 face_leaving:0,-1 +fx/twk_s_g:3,6 +fx/twk_s_g:26,9",
                g: 0.45,
                m: 0.25,
                h: 0.5
              },
              {
                d: 110,
                l: "legs_0:0,0 torso:0,-2 armL_up:0,-2 armR_up:0,-2 head:0,-2 face_restored:0,-2 +fx/twk_m_g:2,4 +fx/twk_m_g:27,7 +fx/twk_s_g:14,1",
                g: 0.15,
                m: 0.6,
                h: 0.8,
                f: 0.55
              },
              {
                d: 110,
                l: "legs_0:0,0 torso:0,-3 armL_up:0,-3 armR_up:0,-3 head:0,-3 face_restored:0,-3 +fx/twk_l_g:2,5 +fx/twk_s_g:27,4 +fx/twk_s_g:8,1",
                g: 0,
                m: 1,
                h: 0.5,
                f: 0.2
              },
              {
                d: 120,
                l: "legs_0:0,0 torso:0,-1 armL_up:0,-1 armR_up:0,-1 head:0,-1 face_restored:0,-1 +fx/twk_s_g:3,8 +fx/twk_m_g:26,6",
                g: 0,
                m: 1,
                h: 0.25
              },
              {
                d: 260,
                l: "legs_0:0,0 torso:0,0 armL_0:0,0 armR_0:0,0 head:0,0 face_restored:0,0 +fx/heart:24,3",
                g: 0,
                m: 1,
                h: 0
              }
            ]
          },
          audience: {
            loop: true,
            frames: [
              {
                d: 300,
                l: "torso:0,5 armL_0:0,5 armR_0:0,5 head:0,5 face_restored:0,5 tile/seat_front",
                m: 1
              },
              {
                d: 260,
                l: "torso:0,5 armL_up:0,5 armR_0:0,5 head:0,4 face_restored:0,4 tile/seat_front +fx/twk_s_g:3,6",
                m: 1
              },
              {
                d: 260,
                l: "torso:0,4 armL_up:0,4 armR_up:0,4 head:0,4 face_restored:0,4 tile/seat_front",
                m: 1
              },
              {
                d: 260,
                l: "torso:0,5 armL_0:0,5 armR_up:0,5 head:0,4 face_restored:0,4 tile/seat_front +fx/twk_s_g:26,8",
                m: 1
              }
            ]
          },
          bust: {
            loop: true,
            w: 64,
            h: 64,
            ax: 32,
            ay: 63,
            frames: [
              { d: 700, l: "b_torso:0,0 b_head:0,0 ~b_face:0,0 +~b_over:0,0" },
              { d: 700, l: "b_torso:0,1 b_head:0,1 ~b_face:0,1 +~b_over:0,1" }
            ]
          }
        },
        label: "엘리트",
        pal2: { e: "s", f: "t", h: "u", j: "O", m: "A", d: "P", n: "q", b: "a", B: "b", i: "w" }
      },
      fx: {
        kind: "fx",
        label: "효과 파티클",
        w: 16,
        h: 16,
        ax: 8,
        ay: 8,
        pieces: {
          note_a_g: {
            x: 0,
            y: 0,
            r: ["...OO..", "..OggO.", "..OgOgO", "..OgOO.", "..OgO..", ".OggO..", "OgggO..", ".OgO...", "..O...."]
          },
          note_a_w: {
            x: 0,
            y: 0,
            r: ["...yy..", "..ywwy.", "..ywywy", "..ywyy.", "..ywy..", ".ywwy..", "ywwwy..", ".ywy...", "..y...."]
          },
          note_a_t: {
            x: 0,
            y: 0,
            r: ["...hh..", "..hTTh.", "..hThTh", "..hThh.", "..hTh..", ".hTTh..", "hTTTh..", ".hTh...", "..h...."]
          },
          note_b_g: {
            x: 0,
            y: 0,
            r: ["...OOOOO.", "..OgggggO", "..OgOOOgO", "..OgO.OgO", "..OgO.OgO", ".OggOOggO", "OgggOgggO", ".OgO.OgO.", "..O...O.."]
          },
          note_b_w: {
            x: 0,
            y: 0,
            r: ["...yyyyy.", "..ywwwwwy", "..ywyyywy", "..ywy.ywy", "..ywy.ywy", ".ywwyywwy", "ywwwywwwy", ".ywy.ywy.", "..y...y.."]
          },
          note_b_t: {
            x: 0,
            y: 0,
            r: ["...hhhhh.", "..hTTTTTh", "..hThhhTh", "..hTh.hTh", "..hTh.hTh", ".hTThhTTh", "hTTThTTTh", ".hTh.hTh.", "..h...h.."]
          },
          note_c_g: {
            x: 0,
            y: 0,
            r: ["...O.", "..OgO", ".OggO", "..OgO", "..OgO", "..OgO", ".OggO", "OgggO", ".OgO.", "..O.."]
          },
          note_c_w: {
            x: 0,
            y: 0,
            r: ["...y.", "..ywy", ".ywwy", "..ywy", "..ywy", "..ywy", ".ywwy", "ywwwy", ".ywy.", "..y.."]
          },
          note_c_t: {
            x: 0,
            y: 0,
            r: ["...h.", "..hTh", ".hTTh", "..hTh", "..hTh", "..hTh", ".hTTh", "hTTTh", ".hTh.", "..h.."]
          },
          spark_s_g: {
            x: 0,
            y: 0,
            r: ["..o..", ".oGo.", "oGGGo", ".oGo.", "..o.."]
          },
          spark_m_g: {
            x: 0,
            y: 0,
            r: ["...o...", "..oGo..", ".ooGoo.", "oGGwGGo", ".ooGoo.", "..oGo..", "...o..."]
          },
          spark_l_g: {
            x: 0,
            y: 0,
            r: ["....o....", "...oGo...", "...oGo...", ".ooGwGoo.", "oGGwwwGGo", ".ooGwGoo.", "...oGo...", "...oGo...", "....o...."]
          },
          spark_s_t: {
            x: 0,
            y: 0,
            r: ["..h..", ".hTh.", "hTTTh", ".hTh.", "..h.."]
          },
          spark_m_t: {
            x: 0,
            y: 0,
            r: ["...h...", "..hTh..", ".hhThh.", "hTTwTTh", ".hhThh.", "..hTh..", "...h..."]
          },
          spark_l_t: {
            x: 0,
            y: 0,
            r: ["....h....", "...hTh...", "...hTh...", ".hhTwThh.", "hTTwwwTTh", ".hhTwThh.", "...hTh...", "...hTh...", "....h...."]
          },
          twk_s_g: {
            x: 0,
            y: 0,
            r: [".G.", "GGG", ".G."]
          },
          twk_m_g: {
            x: 0,
            y: 0,
            r: ["..G..", "..G..", "GGwGG", "..G..", "..G.."]
          },
          twk_l_g: {
            x: 0,
            y: 0,
            r: ["...G...", "...G...", "..GwG..", "GGwwwGG", "..GwG..", "...G...", "...G..."]
          },
          wave_s: {
            x: 0,
            y: 0,
            r: ["w.", ".w", ".w", "w."]
          },
          wave_m: {
            x: 0,
            y: 0,
            r: ["w..", ".w.", "..w", "..w", ".w.", "w.."]
          },
          wave_l: {
            x: 0,
            y: 0,
            r: ["w...", ".w..", "..w.", "...w", "...w", "..w.", ".w..", "w..."]
          },
          wave_sg: {
            x: 0,
            y: 0,
            r: ["g.", ".g", ".g", "g."]
          },
          wave_mg: {
            x: 0,
            y: 0,
            r: ["g..", ".g.", "..g", "..g", ".g.", "g.."]
          },
          wave_lg: {
            x: 0,
            y: 0,
            r: ["g...", ".g..", "..g.", "...g", "...g", "..g.", ".g..", "g..."]
          },
          heart: {
            x: 0,
            y: 0,
            r: ["..xx.xx..", ".xRRxRRx.", "xRrRRRRRx", "xRRRRRRRx", ".xRRRRRx.", "..xRRRx..", "...xRx...", "....x...."]
          },
          mote: {
            x: 0,
            y: 0,
            r: ["T.", "wT"]
          },
          beam: {
            x: 1,
            y: 0,
            r: [
              "...........w.w....w.GG........",
              "........G.G....w.w............",
              ".......G....w.w....G.G........",
              "........GG.w....w.w...G.......",
              ".......GG....w.w....G.........",
              "..........G.w....w.G..G.......",
              ".......G.G....w.w....G.G......",
              "......G....w.w....w.G.G.......",
              "........G.G....w.w....GG......",
              "......GG....w.w....G.G........",
              ".....G...G.w....w.w....G......",
              "......G.G....w.w....G.G.G.....",
              ".....G....G.w....w.G..........",
              ".......G.G....w.w....G.GG.....",
              ".....GG....w.w....w.G....G....",
              "....G...G.G....w.w....G.G.....",
              ".....G.G....w.w....G.G...G....",
              "....G....G.w....w.w....G......",
              "...G..G.G....w.w....G.G..G....",
              "....GG....G.w....w.G....G.G...",
              "...G...G.G....w.w....G.G......",
              "....G.G....w.w....w.G....GG...",
              "...G....G.G....w.w....G.G..G..",
              "..G..G.G....w.w....G.G....G...",
              "....G....G.w....w.w....G.G.G..",
              "..G...G.G....w.w....G.G.......",
              ".G.G.G....G.w....w.G....G.GG..",
              "..G....G.G....w.w....G.G....G.",
              ".G..G.G....w.w....w.G....G.G..",
              "...G....G.G....w.w....G.G...G.",
              ".G...G.G....w.w....G.G....G..G",
              "G.G.G....G.w....w.w....G.G...."
            ]
          }
        },
        anims: {
          note: {
            loop: true,
            frames: [
              { d: 140, l: "+note_a_g:4,4" },
              { d: 140, l: "+note_b_g:3,4" },
              { d: 140, l: "+note_c_g:5,4" }
            ],
            noline: true
          },
          note_white: {
            loop: true,
            frames: [
              { d: 140, l: "+note_a_w:4,4" },
              { d: 140, l: "+note_b_w:3,4" },
              { d: 140, l: "+note_c_w:5,4" }
            ],
            noline: true
          },
          note_hope: {
            loop: true,
            frames: [
              { d: 140, l: "+note_a_t:4,4" },
              { d: 140, l: "+note_b_t:3,4" },
              { d: 140, l: "+note_c_t:5,4" }
            ],
            noline: true
          },
          sparkle: {
            loop: true,
            frames: [
              { d: 90, l: "+twk_s_g:6,6" },
              { d: 90, l: "+twk_m_g:5,5" },
              { d: 110, l: "+twk_l_g:4,4" },
              { d: 90, l: "+twk_m_g:5,5" }
            ],
            noline: true
          },
          sparkle_hope: {
            loop: true,
            frames: [
              { d: 90, l: "+spark_s_t:6,6" },
              { d: 90, l: "+spark_m_t:5,5" },
              { d: 110, l: "+spark_l_t:4,4" },
              { d: 90, l: "+spark_m_t:5,5" }
            ],
            noline: true
          },
          wave: {
            loop: true,
            frames: [
              { d: 100, l: "+wave_s:6,6" },
              { d: 100, l: "+wave_m:5,5" },
              { d: 100, l: "+wave_l:4,4" }
            ],
            noline: true
          },
          heart: {
            loop: true,
            frames: [
              { d: 200, l: "+heart:3,4" },
              { d: 200, l: "+heart:3,3" }
            ],
            noline: true
          }
        }
      },
      tile: {
        kind: "tile",
        label: "타일",
        w: 32,
        h: 32,
        ax: 16,
        ay: 31,
        pieces: {
          seat_front: {
            x: 3,
            y: 24,
            r: [
              "...gggggggggggggggggggg...",
              ".rrrrrrrrrrrrrrrrrrrrrrRR.",
              "gRRRRRRRRRRRRRRRRRRRRRRRxo",
              "gRRRrRRRRRRRrRRRRRRRrRRRxo",
              "rRRRRxRRRRRRRxRRRRRRRxRRxx",
              "rRRRRRRRRRRRRRRRRRRRRRRRxx",
              "rRRRRRRRRRRRRRRRRRRRRRRRxx",
              "xxxxxxxxxxxxxxxxxxxxxxxxxx"
            ]
          },
          beam: {
            x: 1,
            y: 0,
            r: [
              "...........w.w....w.GG........",
              "........G.G....w.w............",
              ".......G....w.w....G.G........",
              "........GG.w....w.w...G.......",
              ".......GG....w.w....G.........",
              "..........G.w....w.G..G.......",
              ".......G.G....w.w....G.G......",
              "......G....w.w....w.G.G.......",
              "........G.G....w.w....GG......",
              "......GG....w.w....G.G........",
              ".....G...G.w....w.w....G......",
              "......G.G....w.w....G.G.G.....",
              ".....G....G.w....w.G..........",
              ".......G.G....w.w....G.GG.....",
              ".....GG....w.w....w.G....G....",
              "....G...G.G....w.w....G.G.....",
              ".....G.G....w.w....G.G...G....",
              "....G....G.w....w.w....G......",
              "...G..G.G....w.w....G.G..G....",
              "....GG....G.w....w.G....G.G...",
              "...G...G.G....w.w....G.G......",
              "....G.G....w.w....w.G....GG...",
              "...G....G.G....w.w....G.G..G..",
              "..G..G.G....w.w....G.G....G...",
              "....G....G.w....w.w....G.G.G..",
              "..G...G.G....w.w....G.G.......",
              ".G.G.G....G.w....w.G....G.GG..",
              "..G....G.G....w.w....G.G....G.",
              ".G..G.G....w.w....w.G....G.G..",
              "...G....G.G....w.w....G.G...G.",
              ".G...G.G....w.w....G.G....G..G",
              "G.G.G....G.w....w.w....G.G...."
            ]
          },
          floor0: {
            x: 0,
            y: 0,
            r: [
              "dddddddddddddddd",
              "dnnnnnnnnnnnnnnk",
              "dnnnnnnnnndnnnnk",
              "dnnmnnnnnnnnnnnk",
              "dnnnnnnnknnnnnnk",
              "dnnnnnnnnknnnnnk",
              "dnnnnnnnnnknnnnk",
              "dnnnnnnnnnnknnnk",
              "dnnnnnnnnnnnnnnk",
              "dnnnnnmnnnnnnnnk",
              "dnnnknnnnnnnnnnk",
              "dnnnnknnnnnndnnk",
              "dnmnnnknnnnnnnnk",
              "dnnnnnnnnnnnnnnk",
              "dnnnnnnnnnnnnnnk",
              "dkkkkkkkkkkkkkkk"
            ]
          },
          floor1: {
            x: 0,
            y: 0,
            r: [
              "dddddddddddddddd",
              "dnnnnnnnnnnnnnnk",
              "dnnnnnnnnnnnnnnk",
              "dnnnnnnnnnndnnnk",
              "dnnnmnnnnnnnnnnk",
              "dnnnnnnnknnnnnnk",
              "dnnnnnnnnknnnnnk",
              "dnnnnnnnnnknnnnk",
              "dnnnnnnnnnnknnnk",
              "dnnnnnnnnnnnnnnk",
              "dnnnknnmnnnnnnnk",
              "dnnnnkknnnnnnnnk",
              "dnnnnnnnnnnnndnk",
              "dnnmnnnnnnnnnnnk",
              "dnnnnnnnnnnnnnnk",
              "dkkkkkkkkkkkkkkk"
            ]
          },
          stage: {
            x: 0,
            y: 0,
            r: [
              "gggggggggggggggggggggggggggggggg",
              "ObbbbbbbbbbbbbbbOBBBBBBBBBBBBBBB",
              "ObbbbbbbbbbbbbbbOBBBBBBBBBBBBBBB",
              "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO",
              "aaaaaaaaOBBBBBBBBBBBBBBBOaaaaaaa",
              "bbbbbbbbOBBBBBBBBBBBBBBBObbbbbbb",
              "bbbbbbbbOBBBBBBBBBBBBBBBObbbbbbb",
              "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO",
              "OaaaaaaaaaaaaaaaOBBBBBBBBBBBBBBB",
              "ObbbbbbbbbbbbbbbOBBBBBBBBBBBBBBB",
              "ObbbbbbbbbbbbbbbOBBBBBBBBBBBBBBB",
              "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO",
              "aaaaaaaaOBBBBBBBBBBBBBBBOaaaaaaa",
              "bbbbbbbbOBBBBBBBBBBBBBBBObbbbbbb",
              "bbbbbbbbOBBBBBBBBBBBBBBBObbbbbbb",
              "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO"
            ]
          },
          spot: {
            x: 1,
            y: 1,
            r: [
              ".........G.G.G.G.G.G..........",
              "......G.G.G.G.G.G.G.G.G.......",
              ".....G.G.G.G.G.G.G.G.G.G.G....",
              "..G.G.G.G.G.G.G.G.G.G.G.G.G...",
              ".G.G.G.G.wGwGwGwGwGwGG.G.G.G..",
              "G.G.G.G.wGwGwGwGwGwGwGG.G.G.G.",
              ".G.G.G.wGwGwGwGwGwGwGwGG.G.G.G",
              "G.G.G.GGwGwGwGwGwGwGwGw.G.G.G.",
              ".G.G.G.GGwGwGwGwGwGwGw.G.G.G.G",
              "..G.G.G.GGwGwGwGwGwGw.G.G.G.G.",
              "...G.G.G.G.G.G.G.G.G.G.G.G.G..",
              "....G.G.G.G.G.G.G.G.G.G.G.....",
              ".......G.G.G.G.G.G.G.G.G......",
              "..........G.G.G.G.G.G........."
            ]
          }
        },
        anims: {
          seat: {
            loop: false,
            frames: [
              { d: 1000, l: "seat_front" }
            ],
            ax: 16
          },
          floor: {
            loop: false,
            w: 16,
            h: 16,
            ax: 8,
            ay: 8,
            frames: [
              { d: 1000, l: "floor0" },
              { d: 1000, l: "floor1" }
            ]
          },
          stage: {
            loop: false,
            w: 32,
            h: 16,
            ax: 16,
            ay: 8,
            frames: [
              { d: 1000, l: "stage" }
            ],
            noline: true
          },
          spot: {
            loop: true,
            w: 32,
            h: 16,
            ax: 16,
            ay: 8,
            frames: [
              { d: 400, l: "+spot" },
              { d: 400, l: "+spot:0,0" }
            ],
            noline: true
          }
        }
      },
      item: {
        kind: "item",
        label: "아이템 아이콘",
        w: 16,
        h: 16,
        ax: 8,
        ay: 8,
        pieces: {
          potion: {
            x: 0,
            y: 0,
            r: [
              "................",
              ".....OOOOOO.....",
              ".....OBBBBO.....",
              "......cccc......",
              "......cwcC......",
              "......cccC......",
              ".....cccccC.....",
              "....cwcccccC....",
              "...cwRRRRRRcC...",
              "...cRrRRRRRRC...",
              "...cRrRRRRRRC...",
              "...cRRRRRRRRC...",
              "...cRRRRRRRxC...",
              "....cRRRRRxC....",
              ".....cCCCCC.....",
              "................"
            ]
          },
          maxmp: {
            x: 1,
            y: 0,
            r: [
              "............G.",
              "...........GwG",
              "............G.",
              "..RRRR..RRRR..",
              ".RrrRRRRRRRRR.",
              "RrRRRRRRRRRRRx",
              "RrRRRRRRRRRRRx",
              "RRRRRRRRRRRRRx",
              ".RRRRRRRRRRRx.",
              "..RRRRRRRRRx..",
              "...RRRRRRRx...",
              "....RRRRRx....",
              ".....RRRx.....",
              "......Rx......"
            ]
          },
          shield: {
            x: 2,
            y: 2,
            r: ["ggggggggggoo", "gCCCCCAAPPPo", "gCCCCCAAPPPo", "gCCCCGAAPPPo", "gCCCGwGAPPPo", "gCCCCGAAPPPo", "gCCCCCAAPPPo", "ggAAAAAAPPo.", ".ggAAAAAPo..", "..ggAAAAo...", "...ggAAo....", "....ggo.....", ".....g......"]
          },
          breaker: {
            x: 4,
            y: 0,
            r: [".....gg..", "....ggg..", "...gwg...", "...ggg...", "..Ggg....", ".Gwgg....", "GGGgggooo", "GGGgggoo.", "...gggo..", "...ggg...", "..Ggg....", "..Go.....", "..Go.....", "..G......", ".G......."]
          },
          key: {
            x: 1,
            y: 1,
            r: [
              "..GGGg........",
              ".GGGggg.......",
              "GGG..ggo......",
              "GG....oo......",
              "Gg....oo......",
              "ggg..ooo......",
              ".ggooooG......",
              "..oooo.gG.....",
              "........gG....",
              ".........gGgg.",
              "..........gg..",
              ".........gggo.",
              ".........g..go",
              ".............o"
            ]
          },
          portal0: {
            x: 1,
            y: 1,
            r: [
              "...qqqqqqqq...",
              "..qqqqqqqPqq..",
              ".qqPppppPPPqq.",
              "qqPpppTTpPPPqq",
              "qPpPPPPTTPPpPq",
              "qPPPPTwTTTPpPq",
              "qqPTTwwTwPPpPq",
              "qqPTTTwwTPTpPq",
              "qqPpTPwwPTppqq",
              "qqPpTPTTTTpPqq",
              "qqqppPPPPPPqqq",
              ".qqqppPPPPqqq.",
              "..qqqPPPPPqq..",
              "...qqqqqqqq..."
            ]
          },
          portal1: {
            x: 1,
            y: 1,
            r: [
              "...qqqqqqqq...",
              "..qqqqqqPPqq..",
              ".qqqPPPPPpPqq.",
              "qqqpppTTPPpPqq",
              "qqppTTTTPPppqq",
              "qPpPPPTwTPppqq",
              "qPPPTwwwwPTpqq",
              "qPPPTwwwTTTpqq",
              "qPPPTPTwTTpPqq",
              "qPPPTTPPTPPPPq",
              "qqqPppTPPPPPqq",
              ".qqqPpppppPqq.",
              "..qqqqPPPPqq..",
              "...qqqqqqqq..."
            ]
          },
          portal2: {
            x: 1,
            y: 1,
            r: [
              "...qqqqqqqq...",
              "..qqPPPPPqqq..",
              ".qqqPPPPppqqq.",
              "qqqPPPPPPppqqq",
              "qqPpTTTTPTpPqq",
              "qqppTPwwPTpPqq",
              "qPpTPTwwTTTPqq",
              "qPpPPwTwwTTPqq",
              "qPpPTTTwTPPPPq",
              "qPpPPTTPPPPpPq",
              "qqPPPpTTpppPqq",
              ".qqPPPppppPqq.",
              "..qqPqqqqqqq..",
              "...qqqqqqqq..."
            ]
          },
          portal3: {
            x: 1,
            y: 1,
            r: [
              "...qqqqqqqq...",
              "..qqPPPPqqqq..",
              ".qqPpppppPqqq.",
              "qqPPPPPTppPqqq",
              "qPPPPTPPTTPPPq",
              "qqPpTTwTPTPPPq",
              "qqpTTTTwwTPPPq",
              "qqpTPwwwwTPPPq",
              "qqppPTwTPPPpPq",
              "qqppPPTTTTppqq",
              "qqPpPPTTpppqqq",
              ".qqPpPPPPPqqq.",
              "..qqPPqqqqqq..",
              "...qqqqqqqq..."
            ]
          }
        },
        anims: {
          potion: {
            loop: false,
            frames: [
              { d: 1000, l: "potion" }
            ]
          },
          maxmp: {
            loop: false,
            frames: [
              { d: 1000, l: "maxmp" }
            ]
          },
          shield: {
            loop: false,
            frames: [
              { d: 1000, l: "shield" }
            ]
          },
          breaker: {
            loop: false,
            frames: [
              { d: 1000, l: "breaker" }
            ]
          },
          key: {
            loop: false,
            frames: [
              { d: 1000, l: "key" }
            ]
          },
          portal: {
            loop: true,
            frames: [
              { d: 130, l: "portal0" },
              { d: 130, l: "portal1" },
              { d: 130, l: "portal2" },
              { d: 130, l: "portal3" }
            ],
            noline: false
          }
        }
      }
    }
  };

  // ======================================================================
  //  RUNTIME  (아래는 데이터 해석/렌더 엔진 - 스프라이트를 추가할 때 고칠 필요 없음)
  // ======================================================================
  var OUT = DATA.outline;
  var PAL = DATA.palette;
  var RGB = {};
  Object.keys(PAL).forEach(function (k) {
    var h = PAL[k];
    RGB[k] = [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  });
  var GOLD = [255, 226, 140];

  var sprites = {};        // group id -> def
  var animIndex = {};      // 'group.anim' -> { g, a, def, anim }
  var baseCache = {};      // key -> canvas (1x)
  var variantCache = {};   // key -> canvas (1x, tinted)
  var scaledCache = {};    // key -> canvas (scaled)
  var urlCache = {};
  var silCache = {};

  function mk(w, h) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }
  function q4(v) { v = +v || 0; return Math.round(Math.max(0, Math.min(1, v)) * 4) / 4; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // --- layer token parsing:  [+|~]name[:dx,dy] -----------------------------
  var tokenCache = {};
  function parseLayers(str) {
    if (tokenCache[str]) return tokenCache[str];
    var out = [];
    str.split(/\s+/).forEach(function (t) {
      if (!t) return;
      var post = false, mood = false, under = false;
      if (t[0] === '+') { post = true; t = t.slice(1); }
      if (t[0] === '-') { under = true; t = t.slice(1); }
      if (t[0] === '~') { mood = true; t = t.slice(1); }
      var dx = 0, dy = 0, i = t.indexOf(':');
      if (i >= 0) {
        var p = t.slice(i + 1).split(',');
        dx = +p[0] || 0; dy = +p[1] || 0; t = t.slice(0, i);
      }
      out.push({ n: t, dx: dx, dy: dy, post: post, under: under, mood: mood });
    });
    return (tokenCache[str] = out);
  }

  function resolvePiece(def, L, mood) {
    var n = L.n, pcs = def.pieces;
    var i = n.indexOf('/');
    if (i > 0) { var og = sprites[n.slice(0, i)]; pcs = og ? og.pieces : {}; n = n.slice(i + 1); }   // 'group/piece' = shared piece
    if (!L.mood) return pcs[n];
    return pcs[n + '_' + mood] || pcs[n + '_waiting'] || null;
  }

  function putPiece(buf, w, h, p, dx, dy) {
    var ox = p.x + dx, oy = p.y + dy;
    for (var j = 0; j < p.r.length; j++) {
      var row = p.r[j], y = oy + j;
      if (y < 0 || y >= h) continue;
      for (var i = 0; i < row.length; i++) {
        var c = row.charCodeAt(i);
        if (c === 46 || c === 32) continue;
        var x = ox + i;
        if (x < 0 || x >= w) continue;
        buf[y * w + x] = row[i];
      }
    }
  }
  function innerLine(buf, w, h, p, dx, dy, olKey) {
    // carve a 1px dark line in what is already drawn, hugging the piece's silhouette
    var ox = p.x + dx, oy = p.y + dy, mark = [];
    function solid(x, y) {
      var r = p.r[y - oy];
      if (!r) return false;
      var ch = r[x - ox];
      return ch !== undefined && ch !== '.' && ch !== ' ';
    }
    for (var j = -1; j <= p.r.length; j++) {
      for (var i = -1; i <= p.r[0].length; i++) {
        var x = ox + i, y = oy + j;
        if (x < 0 || y < 0 || x >= w || y >= h) continue;
        if (solid(x, y)) continue;
        var b = buf[y * w + x];
        if (b === '.') continue;
        if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) mark.push([y * w + x, (typeof olKey === 'string' ? olKey : OUT[b]) || 'k']);
      }
    }
    mark.forEach(function (m) { buf[m[0]] = m[1]; });
  }
  function outerOutline(buf, w, h) {
    var add = [];
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      if (buf[y * w + x] !== '.') continue;
      var n = null;
      // priority: below, right, above, left  (keeps corners stable)
      if (y + 1 < h && buf[(y + 1) * w + x] !== '.') n = buf[(y + 1) * w + x];
      else if (x + 1 < w && buf[y * w + x + 1] !== '.') n = buf[y * w + x + 1];
      else if (y > 0 && buf[(y - 1) * w + x] !== '.') n = buf[(y - 1) * w + x];
      else if (x > 0 && buf[y * w + x - 1] !== '.') n = buf[y * w + x - 1];
      if (n) add.push([y * w + x, OUT[n] || 'k']);
    }
    add.forEach(function (a) { buf[a[0]] = a[1]; });
  }

  // compose one frame to a buffer of palette keys
  function compose(def, anim, fr, mood) {
    var w = anim.w || def.w, h = anim.h || def.h;
    var buf = new Array(w * h);
    for (var i = 0; i < buf.length; i++) buf[i] = '.';
    var layers = parseLayers(fr.l), post = [], under = [];
    mood = fr.mo || mood || 'waiting';
    layers.forEach(function (L) {
      if (L.post) { post.push(L); return; }
      if (L.under) { under.push(L); return; }
      var p = resolvePiece(def, L, mood);
      if (!p) { if (!L.mood) throw new Error('PixelArt: missing piece "' + L.n + '" in ' + def.id); return; }
      if (p.ol) innerLine(buf, w, h, p, L.dx, L.dy, p.ol);
      putPiece(buf, w, h, p, L.dx, L.dy);
    });
    if (!anim.noline) outerOutline(buf, w, h);
    under.forEach(function (L) {           // drawn behind everything (only on empty pixels)
      var p = resolvePiece(def, L, mood);
      if (!p) return;
      var tmp = new Array(w * h);
      for (var i = 0; i < tmp.length; i++) tmp[i] = '.';
      putPiece(tmp, w, h, p, L.dx, L.dy);
      for (i = 0; i < tmp.length; i++) if (buf[i] === '.' && tmp[i] !== '.') buf[i] = tmp[i];
    });
    post.forEach(function (L) {
      var p = resolvePiece(def, L, mood);
      if (p) putPiece(buf, w, h, p, L.dx, L.dy);
    });
    return { buf: buf, w: w, h: h };
  }

  function colorOf(key, def, anim, fr) {
    var k = key;
    if (anim.pal && anim.pal[k]) k = anim.pal[k];
    var c = RGB[k];
    if (fr.m && def.pal2) {
      var k2 = def.pal2[k];
      if (k2 && RGB[k2]) { var c2 = RGB[k2], t = fr.m; c = [lerp(c[0], c2[0], t), lerp(c[1], c2[1], t), lerp(c[2], c2[2], t)]; }
    }
    return c;
  }
  function tintRGB(c, t) {
    // t: {flash, despair, hope}
    var r = c[0], g = c[1], b = c[2];
    if (t.despair) {
      var L = r * .3 + g * .59 + b * .11;
      var gr = L * .82 + 10, gg = L * .84 + 12, gb = L * .9 + 22;
      r = lerp(r, gr, t.despair); g = lerp(g, gg, t.despair); b = lerp(b, gb, t.despair);
    }
    if (t.hope) {
      var h = t.hope * .55;
      r = lerp(r, Math.min(255, r * .55 + GOLD[0] * .6), h);
      g = lerp(g, Math.min(255, g * .55 + GOLD[1] * .6), h);
      b = lerp(b, Math.min(255, b * .45 + GOLD[2] * .35), h);
    }
    if (t.flash) { r = lerp(r, 255, t.flash); g = lerp(g, 255, t.flash); b = lerp(b, 255, t.flash); }
    return [r, g, b];
  }

  function paint(comp, def, anim, fr, tint) {
    var c = mk(comp.w, comp.h), x = c.getContext('2d');
    var img = x.createImageData(comp.w, comp.h), d = img.data;
    var g = fr.g || 0;
    var t = tint || {};
    var comb = { despair: Math.max(g, t.despair || 0), hope: Math.max(fr.h || 0, t.hope || 0), flash: Math.max(fr.f || 0, t.flash || 0) };
    for (var i = 0; i < comp.buf.length; i++) {
      var k = comp.buf[i];
      if (k === '.') continue;
      var col = colorOf(k, def, anim, fr);
      if (comb.despair || comb.hope || comb.flash) col = tintRGB(col, comb);
      d[i * 4] = col[0]; d[i * 4 + 1] = col[1]; d[i * 4 + 2] = col[2]; d[i * 4 + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    return c;
  }

  function lookup(id) {
    var a = animIndex[id];
    if (!a) throw new Error('PixelArt: unknown sprite "' + id + '"');
    return a;
  }
  function wrap(i, n) { i = Math.floor(+i || 0); return ((i % n) + n) % n; }

  function baseFrame(id, frame, mood) {
    var a = lookup(id), n = a.anim.frames.length, f = wrap(frame, n);
    var key = id + '#' + f + '#' + (mood || '');
    var c = baseCache[key];
    if (c) return c;
    var fr = a.anim.frames[f];
    var comp = compose(a.def, a.anim, fr, mood);
    c = baseCache[key] = paint(comp, a.def, a.anim, fr, null);
    c._comp = comp; // keep for dump()
    return c;
  }
  function variantFrame(id, frame, mood, tint) {
    var f = q4(tint.flash), d = q4(tint.despair), h = q4(tint.hope);
    if (!f && !d && !h) return baseFrame(id, frame, mood);
    var a = lookup(id), n = a.anim.frames.length, fi = wrap(frame, n);
    var key = id + '#' + fi + '#' + (mood || '') + '#' + f + '/' + d + '/' + h;
    var c = variantCache[key];
    if (c) return c;
    var base = baseFrame(id, fi, mood);
    c = paint(base._comp, a.def, a.anim, a.anim.frames[fi], { flash: f, despair: d, hope: h });
    return (variantCache[key] = c);
  }
  function silhouette(src, color, key) {
    var k = key + '#' + color, c = silCache[k];
    if (c) return c;
    c = mk(src.width, src.height);
    var x = c.getContext('2d');
    x.drawImage(src, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
    return (silCache[k] = c);
  }
  function tintOf(o) {
    return { flash: o.flash === true ? 1 : o.flash, despair: o.despair, hope: o.hope };
  }

  // ---------------------------------------------------------------- public
  function render(ctx, id, frame, x, y, scale, opts) {
    opts = opts || {};
    scale = scale || 1;
    var a = lookup(id);
    var src = variantFrame(id, frame, opts.mood, tintOf(opts));
    var w = src.width, h = src.height;
    var ax = a.anim.ax != null ? a.anim.ax : a.def.ax, ay = a.anim.ay != null ? a.anim.ay : a.def.ay;
    var mode = opts.anchor || 'pivot';
    if (mode === 'topleft') { ax = 0; ay = 0; }
    else if (mode === 'center') { ax = w / 2; ay = h / 2; }
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    if (opts.alpha != null) ctx.globalAlpha = opts.alpha;
    ctx.translate(Math.round(x), Math.round(y));
    if (opts.flipX) ctx.scale(-1, 1);
    if (opts.outline) {
      var s = silhouette(src, opts.outline, id + '#' + wrap(frame, a.anim.frames.length) + '#' + (opts.mood || ''));
      var t = Math.max(1, Math.round(scale));
      [[-t, 0], [t, 0], [0, -t], [0, t]].forEach(function (o) {
        ctx.drawImage(s, -ax * scale + o[0], -ay * scale + o[1], w * scale, h * scale);
      });
    }
    ctx.drawImage(src, -ax * scale, -ay * scale, w * scale, h * scale);
    ctx.restore();
  }

  function info(id) {
    var a = lookup(id), fr = a.anim.frames, dur = fr.map(function (f) { return f.d || 100; });
    var tot = dur.reduce(function (s, v) { return s + v; }, 0);
    return {
      id: id, group: a.g, anim: a.a, kind: a.def.kind || '', label: a.def.label || a.g,
      w: a.anim.w || a.def.w, h: a.anim.h || a.def.h,
      ax: a.anim.ax != null ? a.anim.ax : a.def.ax, ay: a.anim.ay != null ? a.anim.ay : a.def.ay,
      frames: fr.length, durations: dur, total: tot, loop: a.anim.loop !== false
    };
  }
  function frameAt(id, tMs, opts) {
    var a = lookup(id), fr = a.anim.frames, n = fr.length;
    if (n === 1) return 0;
    var tot = 0, i;
    for (i = 0; i < n; i++) tot += fr[i].d || 100;
    var t = +tMs || 0;
    if (a.anim.loop === false || (opts && opts.loop === false)) t = Math.min(t, tot - 1); else t = ((t % tot) + tot) % tot;
    for (i = 0; i < n; i++) { t -= fr[i].d || 100; if (t < 0) return i; }
    return n - 1;
  }
  function play(ctx, id, tMs, x, y, scale, opts) { render(ctx, id, frameAt(id, tMs, opts), x, y, scale, opts); }

  function toCanvas(id, frame, opts) {
    opts = opts || {};
    var scale = Math.max(1, Math.floor(opts.scale || 1));
    var a = lookup(id), f = wrap(frame, a.anim.frames.length), t = tintOf(opts);
    var key = [id, f, opts.mood || '', q4(t.flash), q4(t.despair), q4(t.hope), scale, opts.flipX ? 1 : 0].join('|');
    var c = scaledCache[key];
    if (c) return c;
    var src = variantFrame(id, f, opts.mood, t);
    c = mk(src.width * scale, src.height * scale);
    var x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    if (opts.flipX) { x.translate(c.width, 0); x.scale(-1, 1); }
    x.drawImage(src, 0, 0, c.width, c.height);
    return (scaledCache[key] = c);
  }
  function toDataURL(id, frame, opts) {
    opts = opts || {};
    var t = tintOf(opts);
    var a = lookup(id), f = wrap(frame, a.anim.frames.length);
    var key = [id, f, opts.mood || '', q4(t.flash), q4(t.despair), q4(t.hope), opts.scale || 1, opts.flipX ? 1 : 0].join('|');
    return urlCache[key] || (urlCache[key] = toCanvas(id, f, opts).toDataURL('image/png'));
  }
  function dump(id, frame, mood) {
    var c = baseFrame(id, frame || 0, mood), comp = c._comp, out = [];
    for (var y = 0; y < comp.h; y++) out.push(comp.buf.slice(y * comp.w, (y + 1) * comp.w).join(''));
    return out;
  }

  function register(gid, def) {
    def.id = gid;
    sprites[gid] = def;
    Object.keys(def.anims).forEach(function (an) {
      var anim = def.anims[an];
      if (anim.alias) {
        var t = def.anims[anim.alias];
        anim = def.anims[an] = Object.assign({}, t, anim, { frames: t.frames, alias: anim.alias });
      }
      animIndex[gid + '.' + an] = { g: gid, a: an, def: def, anim: anim };
    });
  }
  function prerender(mood) {
    Object.keys(animIndex).forEach(function (id) {
      var a = animIndex[id];
      var moods = a.def.kind === 'undead' ? DATA.moods : [''];
      for (var f = 0; f < a.anim.frames.length; f++) moods.forEach(function (m) { baseFrame(id, f, m); });
    });
  }
  function list(filter) {
    var out = [];
    Object.keys(animIndex).forEach(function (id) {
      if (filter && id.indexOf(filter) !== 0 && sprites[animIndex[id].g].kind !== filter) return;
      out.push(info(id));
    });
    return out;
  }
  function groups() {
    return Object.keys(sprites).map(function (g) {
      var d = sprites[g];
      return { id: g, kind: d.kind || '', label: d.label || g, anims: Object.keys(d.anims), w: d.w, h: d.h };
    });
  }

  // --- sprite sheet (used by the PNG exporter and handy for debugging) -----
  function sheet(gid, opts) {
    opts = opts || {};
    var d = sprites[gid], pad = opts.pad == null ? 0 : opts.pad, bg = opts.bg || null;
    var rows = [], maxCols = 0, W = 0, H = 0;
    function add(label, an, mood) {
      var i = info(gid + '.' + an);
      rows.push({ label: label, an: an, mood: mood, i: i });
      maxCols = Math.max(maxCols, i.frames * (i.w + pad));
    }
    Object.keys(d.anims).forEach(function (an) { add(an, an, d.kind === 'undead' ? 'waiting' : ''); });
    if (d.kind === 'undead' && opts.moodRows !== false) {
      ['idle', 'walk', 'bust'].forEach(function (an) {
        DATA.moods.slice(1).forEach(function (m) { if (d.anims[an]) add(an + '@' + m, an, m); });
      });
    }
    rows.forEach(function (r) { r.y = H; H += r.i.h + pad; });
    W = maxCols;
    var c = mk(W, H), x = c.getContext('2d');
    if (bg) { x.fillStyle = bg; x.fillRect(0, 0, W, H); }
    x.imageSmoothingEnabled = false;
    var atlas = { image: gid + '.png', size: { w: W, h: H }, group: gid, kind: d.kind || '', label: d.label || gid, cell: { w: d.w, h: d.h }, anims: {} };
    rows.forEach(function (r) {
      var id = gid + '.' + r.an, fs = [];
      for (var f = 0; f < r.i.frames; f++) {
        var fx = f * (r.i.w + pad);
        x.drawImage(baseFrame(id, f, r.mood), fx, r.y);
        fs.push({ x: fx, y: r.y, w: r.i.w, h: r.i.h, d: r.i.durations[f] });
      }
      var o = { loop: r.i.loop, pivot: { x: r.i.ax, y: r.i.ay }, total: r.i.total, frames: fs };
      if (r.mood && r.mood !== 'waiting') o.mood = r.mood;
      atlas.anims[r.label] = o;
    });
    return { canvas: c, atlas: atlas };
  }

  function define(gid, def) { register(gid, def); prerender(); }

  Object.keys(DATA.sprites).forEach(function (g) { register(g, DATA.sprites[g]); });
  prerender();

  var PixelArt = {
    version: DATA.version,
    palette: PAL,
    ramps: DATA.ramps,
    outlineMap: OUT,
    moods: DATA.moods,
    sprites: sprites,
    render: render,
    play: play,
    frameAt: frameAt,
    toCanvas: toCanvas,
    toDataURL: toDataURL,
    list: list,
    groups: groups,
    info: info,
    dump: dump,
    sheet: sheet,
    define: define,
    has: function (id) { return !!animIndex[id]; }
  };
  root.PixelArt = PixelArt;
  if (typeof module !== 'undefined' && module.exports) module.exports = PixelArt;

})(typeof window !== "undefined" ? window : this);
