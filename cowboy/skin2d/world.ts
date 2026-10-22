/** 100 authored encounters across six hand-drawn regions, followed by a gentle loop. */
export const CHAPTERS = [
  {id:'mesa',name:'노을 협곡',en:'SUNSET MESA',sky:['#38496e','#ec9d83','#f8cf9a'],far:'#8c657b',near:'#76505c',ground:'#b37f67',accent:'#ffd18a',boss:'붉은 모래 대장',bossEn:'Red Sand Marshal'},
  {id:'town',name:'먼지바람 마을',en:'DUSTWIND TOWN',sky:['#414575','#ab6e8f','#f5bd9e'],far:'#685071',near:'#493f61',ground:'#8c6a72',accent:'#ffbd8d',boss:'무법자 잭',bossEn:'Outlaw Jack'},
  {id:'rail',name:'달빛 철도',en:'MOONLIGHT RAIL',sky:['#18283f','#456d89','#93b5b9'],far:'#365271',near:'#243d58',ground:'#536874',accent:'#9de2ed',boss:'철갑 기관사',bossEn:'The Iron Conductor'},
  {id:'canyon',name:'붉은 바위 관문',en:'REDROCK GATE',sky:['#422c54','#bb6668','#eeaa7d'],far:'#9d5b68',near:'#694052',ground:'#996052',accent:'#ffa69e',boss:'협곡의 파수꾼',bossEn:'Canyon Warden'},
  {id:'mine',name:'별빛 수정 광산',en:'STARLIGHT MINE',sky:['#111b38','#343869','#64658b'],far:'#333653',near:'#242d4c',ground:'#4e536c',accent:'#9ce5d8',boss:'수정 골렘',bossEn:'Crystal Golem'},
  {id:'fort',name:'황혼의 요새',en:'TWILIGHT CITADEL',sky:['#29233f','#654c77','#c18090'],far:'#5c486b',near:'#3b3453',ground:'#696076',accent:'#d9b8ff',boss:'황혼의 군주',bossEn:'The Dusk Lord'},
] as const;

type Plan = {name:string;nameEn:string;hint:string;hintEn:string;style:'scout'|'rush'|'swarm'|'brute'|'mixed'|'boss'};
const plans:Plan[] = [
{name:'첫 순찰의 흔적',nameEn:'Tracks of the First Patrol',hint:'두 갈래 길을 살피며 느린 적부터 조준하세요.',hintEn:'Watch both lanes and aim for the slower targets first.',style:'scout'},
{name:'선인장 그림자',nameEn:'Cactus Shadows',hint:'흩어진 적을 리볼버로 차분히 정리하세요.',hintEn:'Pick off scattered targets with steady revolver shots.',style:'scout'},
{name:'모래 언덕의 발자국',nameEn:'Footprints on the Dunes',hint:'빠른 돌격병이 가까워지기 전에 우선 처치하세요.',hintEn:'Deal with runners before they close the distance.',style:'rush'},
{name:'유령마차 습격',nameEn:'Ambush of the Ghost Coach',hint:'넓은 사거리로 앞줄을 끊고 후방을 확인하세요.',hintEn:'Break the front line, then check for stragglers.',style:'mixed'},
{name:'붉은 모래 결투',nameEn:'Duel in Red Sand',hint:'대장의 진입 전에 탄창을 아끼고 집중 사격하세요.',hintEn:'Save your focus for the marshal and fire with purpose.',style:'boss'},
{name:'버려진 역참',nameEn:'The Abandoned Waystation',hint:'새로운 세 갈래 진입로를 놓치지 마세요.',hintEn:'Cover the newly opened third approach.',style:'scout'},
{name:'박쥐바위 오솔길',nameEn:'Bat-Rock Trail',hint:'속도가 다른 적의 간격을 보고 사격을 나누세요.',hintEn:'Time shots around the enemies’ different speeds.',style:'mixed'},
{name:'협곡의 사격선',nameEn:'Canyon Firing Line',hint:'달리는 적을 먼저 끊어 압박을 낮추세요.',hintEn:'Stop the runners first to ease the pressure.',style:'rush'},
{name:'먼지바람 추격전',nameEn:'Dustwind Pursuit',hint:'빠른 공세에는 개틀링으로 흐름을 끊으세요.',hintEn:'Use the gatling to break the fast-moving wave.',style:'rush'},
{name:'역마차 호위대',nameEn:'Stagecoach Escort',hint:'튼튼한 적에게 라이플을, 무리에는 폭발물을 쓰세요.',hintEn:'Use the rifle on tough foes and explosives on clusters.',style:'boss'},
{name:'텅 빈 술집 거리',nameEn:'Empty Saloon Street',hint:'좁은 골목에 모이는 적을 산탄총으로 흩트리세요.',hintEn:'Scatter enemies bunching in the narrow street.',style:'swarm'},
{name:'보안관의 마지막 종',nameEn:'The Sheriff’s Last Bell',hint:'세 방향을 번갈아 살피며 틈을 막으세요.',hintEn:'Rotate your attention across all three lanes.',style:'mixed'},
{name:'붉은 손수건단',nameEn:'The Red Bandanna Gang',hint:'빠른 적이 중장갑 적 뒤에 숨지 않게 하세요.',hintEn:'Keep runners from slipping behind the heavy hitters.',style:'rush'},
{name:'가죽장화의 행진',nameEn:'March of the Leather Boots',hint:'몰려드는 작은 적에게 폭발 반경을 활용하세요.',hintEn:'Make the most of blast radius against clustered foes.',style:'swarm'},
{name:'검은 잭의 결투',nameEn:'Black Jack’s Showdown',hint:'대장과 호위병이 함께 올 때는 관통 사격이 유리합니다.',hintEn:'Piercing shots help when the boss and guards arrive together.',style:'boss'},
{name:'철로변의 안개',nameEn:'Fog Along the Rails',hint:'두 선로를 번갈아 조준해 빈틈을 줄이세요.',hintEn:'Switch between the two tracks to close gaps.',style:'scout'},
{name:'화물칸의 소동',nameEn:'Ruckus in the Freight Cars',hint:'약한 적이 무리를 이루면 산탄과 폭발물로 대응하세요.',hintEn:'Counter clustered light foes with spread and blast damage.',style:'swarm'},
{name:'기관차의 돌진',nameEn:'Locomotive Charge',hint:'느린 대형 적은 라이플로 미리 약화하세요.',hintEn:'Soften the large, slow enemies with rifle fire.',style:'brute'},
{name:'달빛 신호탄',nameEn:'Moonlit Signal Flare',hint:'세 레인에 흩어진 빠른 적을 놓치지 마세요.',hintEn:'Track the fast targets spread across three lanes.',style:'rush'},
{name:'철갑 기관사의 결전',nameEn:'Showdown with the Iron Conductor',hint:'장갑 대장에게 관통 라이플을 집중하세요.',hintEn:'Focus piercing rifle shots on the armored conductor.',style:'boss'},
{name:'붉은 바위의 울림',nameEn:'Echoes of Redrock',hint:'한 레인에 모인 적을 빠르게 정리하세요.',hintEn:'Clear the single-lane group before it builds up.',style:'swarm'},
{name:'쌍둥이 절벽의 그림자',nameEn:'Shadows of Twin Bluffs',hint:'양쪽 절벽 사이로 나타나는 적을 주시하세요.',hintEn:'Watch for foes appearing between the twin bluffs.',style:'scout'},
{name:'관문의 방패벽',nameEn:'Shieldwall at the Gate',hint:'튼튼한 방패병은 라이플로, 뒤따르는 적은 개틀링으로 막으세요.',hintEn:'Use the rifle on brutes and the gatling on those behind.',style:'brute'},
{name:'절벽길 매복',nameEn:'Cliffside Crossfire',hint:'세 방향에서 오는 돌격을 순서대로 끊으세요.',hintEn:'Interrupt the three-lane rush one approach at a time.',style:'rush'},
{name:'협곡 파수꾼의 맹세',nameEn:'Oath of the Canyon Warden',hint:'대장의 공격 간격을 이용해 안전하게 집중 사격하세요.',hintEn:'Use the warden’s attack pauses for focused fire.',style:'boss'},
{name:'수정 광맥의 속삭임',nameEn:'Whispers in the Crystal Vein',hint:'작은 무리는 폭발물 한 발로 흩어 놓으세요.',hintEn:'Break up small swarms with a well-placed explosive.',style:'swarm'},
{name:'깊은 갱도의 등불',nameEn:'Lanterns in the Deep Shaft',hint:'두 레인을 번갈아 보며 느린 적을 먼저 약화하세요.',hintEn:'Alternate lanes and weaken slow enemies early.',style:'mixed'},
{name:'결정 파편 폭풍',nameEn:'Crystal Shard Squall',hint:'몰려드는 적에게 개틀링을, 큰 표적에는 라이플을 쓰세요.',hintEn:'Use the gatling on crowds and the rifle on large targets.',style:'mixed'},
{name:'광산의 공명',nameEn:'Resonance of the Mine',hint:'광산의 좁은 길에서는 빠른 적을 우선 견제하세요.',hintEn:'Prioritize runners in the mine’s narrow passages.',style:'rush'},
{name:'수정 심장의 수호자',nameEn:'Guardian of the Crystal Heart',hint:'대장의 높은 체력에 대비해 꾸준히 관통 사격하세요.',hintEn:'Prepare for a durable boss with steady piercing fire.',style:'boss'},
{name:'요새 외곽 순찰',nameEn:'Outer Citadel Patrol',hint:'넓게 퍼진 적의 진입로를 차례로 확인하세요.',hintEn:'Check each approach as the enemies spread out.',style:'scout'},
{name:'황혼의 첨탑',nameEn:'Spire at Twilight',hint:'빠른 적과 장갑 적이 겹치기 전에 우선순위를 정하세요.',hintEn:'Set priorities before runners and brutes overlap.',style:'mixed'},
{name:'성벽 위의 난전',nameEn:'Scramble on the Ramparts',hint:'무리가 성벽에 닿기 전에 개틀링으로 압박하세요.',hintEn:'Hold the gatling on crowds before they reach the walls.',style:'swarm'},
{name:'왕실 근위대의 돌격',nameEn:'Charge of the Royal Guard',hint:'튼튼한 근위병은 폭발물과 라이플을 번갈아 상대하세요.',hintEn:'Alternate explosives and rifle fire against the guards.',style:'brute'},
{name:'황혼 군주의 왕좌',nameEn:'Throne of the Dusk Lord',hint:'마지막 요새 대장에게 무기를 아끼지 마세요.',hintEn:'Bring every weapon to bear on the citadel boss.',style:'boss'},
{name:'잿빛 아침의 매복',nameEn:'Ambush at Ashen Dawn',hint:'익숙한 땅에도 새로운 세 레인을 경계하세요.',hintEn:'Watch all three lanes even on familiar ground.',style:'mixed'},
{name:'메마른 강바닥',nameEn:'The Dry Riverbed',hint:'느린 적을 먼저 약화하고 빠른 적을 마무리하세요.',hintEn:'Weaken slow foes first, then finish the runners.',style:'mixed'},
{name:'유성우 아래 행군',nameEn:'March Beneath the Meteor Shower',hint:'작은 적이 몰릴 때 폭발물의 재사용을 맞추세요.',hintEn:'Time explosive reloads for the incoming swarm.',style:'swarm'},
{name:'황야의 무거운 발걸음',nameEn:'Heavy Footsteps in the Wilds',hint:'대형 적의 체력에 맞춰 관통탄을 이어 쏘세요.',hintEn:'Chain piercing shots into the heavy targets.',style:'brute'},
{name:'붉은 모래의 재대결',nameEn:'Red Sand Rematch',hint:'보스의 호위 무리와 대장을 한 번에 몰아치세요.',hintEn:'Pressure the boss and escorting group together.',style:'boss'},
{name:'마을 회관의 경보',nameEn:'Alarm at the Town Hall',hint:'골목에서 빠르게 튀어나오는 적을 먼저 겨누세요.',hintEn:'Aim first at foes darting out of the alleys.',style:'rush'},
{name:'술집 뒤편의 비밀',nameEn:'Secret Behind the Saloon',hint:'한 레인으로 몰리는 적에게 산탄을 퍼부으세요.',hintEn:'Spread shotgun fire through the single-lane pack.',style:'swarm'},
{name:'보안관의 포위망',nameEn:'The Sheriff’s Encirclement',hint:'여러 레인의 간격을 보고 사격 타이밍을 나누세요.',hintEn:'Space your shots across the lanes as gaps shift.',style:'mixed'},
{name:'은행 금고의 수문장',nameEn:'Vaultkeeper at the Bank',hint:'큰 표적은 라이플로 약화하고 군중은 폭발물로 밀어내세요.',hintEn:'Soften the brute with a rifle and blast back the crowd.',style:'brute'},
{name:'잭의 검은 깃발',nameEn:'Jack’s Black Banner',hint:'대장의 돌진을 유도한 뒤 반격을 집중하세요.',hintEn:'Bait the boss’s charge, then commit to the counterattack.',style:'boss'},
{name:'급행열차의 종착역',nameEn:'Last Stop of the Express',hint:'선로 양쪽에 흩어진 적을 차례로 정리하세요.',hintEn:'Clear the scattered enemies on both tracks in turn.',style:'scout'},
{name:'증기와 연막',nameEn:'Steam and Smoke',hint:'몰려오는 무리에 개틀링을 끊지 말고 유지하세요.',hintEn:'Keep gatling pressure on the converging crowd.',style:'swarm'},
{name:'화물열차의 거인',nameEn:'Giant of the Freight Train',hint:'장갑 적이 쌓이기 전에 관통 사격을 집중하세요.',hintEn:'Focus piercing fire before armored foes accumulate.',style:'brute'},
{name:'유령 승객의 습격',nameEn:'Attack of the Phantom Passengers',hint:'빠른 적을 놓치지 않도록 세 레인을 순회하세요.',hintEn:'Sweep all three lanes so runners cannot slip through.',style:'rush'},
{name:'철로의 마지막 신호',nameEn:'Final Signal on the Rails',hint:'철갑 보스에게 라이플을 겨누고 호위병도 살피세요.',hintEn:'Target the armored boss while keeping guards in view.',style:'boss'},
{name:'돌문 앞의 잔영',nameEn:'Afterimages at the Stone Gate',hint:'익숙한 대열 사이의 빠른 적부터 끊으세요.',hintEn:'Pick off the runners hidden among familiar ranks.',style:'rush'},
{name:'바위기둥의 미로',nameEn:'Maze of Stone Pillars',hint:'한 레인으로 몰리는 적을 폭발물로 흩트리세요.',hintEn:'Disperse the single-lane crowd with explosives.',style:'swarm'},
{name:'붉은 비탈의 방패병',nameEn:'Shieldbearers on the Red Slope',hint:'튼튼한 방패병에 라이플을 집중하세요.',hintEn:'Keep rifle pressure on the sturdy shieldbearers.',style:'brute'},
{name:'협곡을 가르는 돌풍',nameEn:'Gale Through the Canyon',hint:'빠른 공세가 겹치기 전에 개틀링으로 끊어내세요.',hintEn:'Break the overlapping rush with the gatling.',style:'rush'},
{name:'관문의 봉인',nameEn:'The Gate’s Seal',hint:'파수꾼이 호위를 부르면 무기 전환을 빠르게 하세요.',hintEn:'Switch weapons quickly when the warden calls guards.',style:'boss'},
{name:'수정 종유석 길',nameEn:'Crystal Stalactite Path',hint:'세 레인 중 적이 몰린 쪽에 화력을 옮기세요.',hintEn:'Shift your fire to whichever lane is most crowded.',style:'mixed'},
{name:'광부들의 귀환',nameEn:'Return of the Miners',hint:'두 갈래로 나뉜 무리를 놓치지 마세요.',hintEn:'Keep track of the pack splitting across two lanes.',style:'swarm'},
{name:'푸른 불꽃 광맥',nameEn:'Bluefire Lode',hint:'빠른 적과 느린 적을 구분해 순서대로 처치하세요.',hintEn:'Separate fast and slow targets and clear them in order.',style:'mixed'},
{name:'지하 호수의 거수',nameEn:'Behemoth at the Underground Lake',hint:'커다란 적에게 라이플과 다이너마이트를 이어 쓰세요.',hintEn:'Chain rifle and dynamite damage into the giant.',style:'brute'},
{name:'깊은 곳의 맥동',nameEn:'Pulse from the Deep',hint:'수정 대장의 약점을 노려 꾸준히 관통 사격하세요.',hintEn:'Keep piercing shots trained on the crystal boss.',style:'boss'},
{name:'서쪽 성루의 횃불',nameEn:'Torches on the West Wall',hint:'성루 양쪽에서 접근하는 적을 번갈아 견제하세요.',hintEn:'Alternate pressure on enemies approaching both walls.',style:'mixed'},
{name:'요새의 사냥개',nameEn:'Hounds of the Citadel',hint:'빠르게 달려드는 적을 가장 먼저 막으세요.',hintEn:'Stop the charging enemies before anything else.',style:'rush'},
{name:'대연회장의 난입',nameEn:'Raid on the Grand Hall',hint:'밀집한 적에게 폭발물을 쓰고 남은 적을 조준하세요.',hintEn:'Blast the cluster, then aim at whoever remains.',style:'swarm'},
{name:'황금 갑옷의 망령',nameEn:'Wraith in Gilded Armor',hint:'장갑을 두른 거수에게 관통탄을 집중하세요.',hintEn:'Focus piercing ammunition on the armored brute.',style:'brute'},
{name:'요새의 검은 깃발',nameEn:'Black Standard of the Citadel',hint:'대장의 호위와 본대를 번갈아 제압하세요.',hintEn:'Alternate pressure between the boss escort and main force.',style:'boss'},
{name:'일곱 번째 석양',nameEn:'The Seventh Sunset',hint:'세 방향의 적을 침착하게 순서대로 정리하세요.',hintEn:'Calmly clear threats from all three approaches.',style:'mixed'},
{name:'멀리서 울린 총성',nameEn:'A Shot from Far Away',hint:'먼저 보이는 큰 표적을 라이플로 약화하세요.',hintEn:'Weaken the first large target with rifle fire.',style:'brute'},
{name:'모래바람의 소용돌이',nameEn:'Whirlwind of Sand',hint:'산탄총으로 흩어진 광산 무리를 정리하고, 작은 적이 몰리면 다이너마이트를 선택하세요.',hintEn:'Clear the scattered mine swarm with the shotgun, then choose dynamite when light foes cluster.',style:'swarm'},
{name:'황야의 추격자들',nameEn:'Pursuers Across the Wilds',hint:'빠른 적이 여러 레인으로 갈라지기 전에 노리세요.',hintEn:'Target runners before they split across the lanes.',style:'rush'},
{name:'마지막 별빛 대장',nameEn:'Marshal of the Last Starlight',hint:'이번 순환의 마지막 대장을 향해 모든 화력을 모으세요.',hintEn:'Bring every weapon to bear on this cycle’s final marshal.',style:'boss'},
{name:'폐광의 문지기',nameEn:'Gatekeeper of the Old Mine',hint:'좁은 통로의 튼튼한 적에게 라이플을 아끼지 마세요.',hintEn:'Spend rifle rounds on brutes in the narrow passage.',style:'brute'},
{name:'녹슨 선로의 메아리',nameEn:'Echoes on Rusted Rails',hint:'두 레인에 나뉜 적을 빠르게 오가며 막으세요.',hintEn:'Move quickly between the two lanes to hold them back.',style:'mixed'},
{name:'정오의 뜨거운 탄환',nameEn:'Noon-Hot Bullets',hint:'빠른 공세는 개틀링으로, 뒤의 큰 적은 라이플로 처리하세요.',hintEn:'Use gatling on runners and rifle on the brute behind.',style:'rush'},
{name:'무너진 성벽의 무리',nameEn:'Horde at the Fallen Wall',hint:'커다란 무리를 폭발물로 끊고 남은 적을 쫓으세요.',hintEn:'Break the horde with explosives, then chase the stragglers.',style:'swarm'},
{name:'두 번째 황혼 군주',nameEn:'The Second Dusk Lord',hint:'돌진과 호위 소환에 대비해 자리를 지키며 반격하세요.',hintEn:'Hold your ground and counter charges and summoned guards.',style:'boss'},
{name:'북쪽 협곡의 길잡이',nameEn:'Guide of the Northern Canyon',hint:'익숙한 두 레인의 사각을 살피세요.',hintEn:'Check the blind spots along the familiar two lanes.',style:'scout'},
{name:'붉은 바위 폭우',nameEn:'Redrock Downpour',hint:'쏟아지는 작은 적에게 개틀링을 꾸준히 유지하세요.',hintEn:'Keep steady gatling fire on the incoming swarm.',style:'swarm'},
{name:'유성 철도의 그림자',nameEn:'Shadows of the Meteor Rail',hint:'빠른 적이 선로를 건너기 전에 먼저 제압하세요.',hintEn:'Stop the runners before they cross the tracks.',style:'rush'},
{name:'수정 갑주의 거인',nameEn:'Giant in Crystal Armor',hint:'장갑 적을 관통탄으로 누르고 폭발물은 무리를 위해 남기세요.',hintEn:'Pierce the armored foe and save explosives for the crowd.',style:'brute'},
{name:'황야의 철갑 심판',nameEn:'Iron Judgment of the Wilds',hint:'5번째 결전입니다. 장갑 대장에게 관통 사격을 집중하세요.',hintEn:'The fifth duel: focus piercing fire on the armored boss.',style:'boss'},
{name:'서부의 긴 그림자',nameEn:'Long Shadow of the West',hint:'세 레인 끝에서 다가오는 적의 속도를 살피세요.',hintEn:'Read enemy speeds as they approach across three lanes.',style:'mixed'},
{name:'부서진 마차의 역습',nameEn:'Counterattack at the Broken Wagon',hint:'한 레인으로 뭉친 적을 산탄과 폭발물로 정리하세요.',hintEn:'Clear the single-lane pack with spread and blast damage.',style:'swarm'},
{name:'검은 모래 돌격대',nameEn:'Black Sand Raiders',hint:'빠른 돌격대가 대열을 무너뜨리기 전에 막으세요.',hintEn:'Stop the raiders before their speed breaks your line.',style:'rush'},
{name:'마지막 변경의 거수',nameEn:'Behemoth at the Last Frontier',hint:'큰 표적의 체력을 라이플로 차근차근 깎으세요.',hintEn:'Chip away at the large target with deliberate rifle shots.',style:'brute'},
{name:'백 번째 결투: 황야의 새벽',nameEn:'Duel 100: Dawn of the Wilds',hint:'100번째 결전입니다. 대장을 쓰러뜨리면 원정이 새로 시작됩니다.',hintEn:'The hundredth duel: defeat the boss to begin a fresh expedition.',style:'boss'},
{name:'검은 협곡의 우회로',nameEn:'Detour through Black Canyon',hint:'세 레인으로 흩어지는 적을 차례로 조준하세요.',hintEn:'Aim in turn at enemies spreading across three lanes.',style:'mixed'},
{name:'고요한 탄광촌',nameEn:'Quiet Mining Camp',hint:'느린 적의 뒤를 따르는 돌격병을 놓치지 마세요.',hintEn:'Watch for runners following behind the slower targets.',style:'rush'},
{name:'청록빛 수정비',nameEn:'Teal Crystal Rain',hint:'작은 적 무리는 산탄과 폭발물로 정리하세요.',hintEn:'Clear small enemy groups with spread and blast damage.',style:'swarm'},
{name:'철문을 두드리는 거수',nameEn:'Behemoth at the Iron Door',hint:'장갑 거수를 라이플로 약화한 뒤 마무리하세요.',hintEn:'Weaken the armored brute with your rifle, then finish it.',style:'brute'},
{name:'수정 골렘의 재림',nameEn:'Return of the Crystal Golem',hint:'대장의 단단한 체력에 맞춰 관통탄을 꾸준히 쏘세요.',hintEn:'Keep piercing shots steady against the boss’s thick hide.',style:'boss'},
{name:'요새 아래의 시장길',nameEn:'Market Road Below the Citadel',hint:'양쪽 진입로를 오가며 빈틈을 막으세요.',hintEn:'Move between both approaches to close the gaps.',style:'scout'},
{name:'까마귀 망루의 경보',nameEn:'Alarm at Ravenwatch',hint:'빠른 적부터 끊어 본대의 진입을 늦추세요.',hintEn:'Stop the runners first to slow the main force.',style:'rush'},
{name:'황혼의 검은 물결',nameEn:'Black Tide at Dusk',hint:'무리가 겹치면 폭발물로 전열을 무너뜨리세요.',hintEn:'Break overlapping ranks with an explosive.',style:'swarm'},
{name:'석상 수호대의 행진',nameEn:'March of the Stone Guard',hint:'튼튼한 적은 관통 사격으로, 빠른 적은 개틀링으로 막으세요.',hintEn:'Pierce the brutes and hold runners back with the gatling.',style:'mixed'},
{name:'요새 지하의 군주',nameEn:'Lord Beneath the Citadel',hint:'대장의 돌진을 피하고 호위병을 먼저 제압하세요.',hintEn:'Evade the boss charge and clear its guards first.',style:'boss'},
{name:'해 뜨기 전의 결투장',nameEn:'Arena Before Sunrise',hint:'세 레인에 나뉜 적의 속도를 보고 표적을 고르세요.',hintEn:'Choose targets by speed as foes spread across three lanes.',style:'mixed'},
{name:'서부 변경의 마지막 무리',nameEn:'Last Horde on the Western Frontier',hint:'많은 적이 한꺼번에 몰리면 폭발 반경을 활용하세요.',hintEn:'Use blast radius when a large group arrives together.',style:'swarm'},
{name:'황야의 왕실 근위대',nameEn:'Royal Guard of the Wilds',hint:'빠른 근위병이 지나치기 전에 조준을 유지하세요.',hintEn:'Keep your aim on fast guards before they rush past.',style:'rush'},
{name:'새벽을 가르는 거인',nameEn:'Giant Who Splits the Dawn',hint:'큰 표적을 라이플로 압박하며 주변 적도 살피세요.',hintEn:'Pressure the giant with rifle fire and watch nearby foes.',style:'brute'},
{name:'백 번째 대장: 황야의 새벽',nameEn:'The Hundredth Boss: Wilds at Dawn',hint:'마지막 대장입니다. 격파 후 첫 지역부터 원정이 순환합니다.',hintEn:'The final boss: defeat it to loop back to the first region.',style:'boss'},
];

// Region changes align with boss-clear milestones: 15,15,20,15,15,20 levels.
const chapterEnds=[15,30,50,65,80,100];
// Keep compact authored titles; only replace names whose landmark conflicts with their assigned region.
const titleOverrides:Record<number,[string,string]>={
  8:['석양 협곡의 총격선','Gunline at Sunset Canyon'],9:['노을 언덕 추격전','Chase over Sunset Ridge'],
  11:['협곡 술집의 정적','Silence at the Canyon Saloon'],12:['협곡 보안관의 종','The Canyon Sheriff’s Bell'],15:['붉은 모래 대장의 결전','Duel with the Red Sand Marshal'],
  16:['먼지바람 마을의 가로등','Dustwind Town Lanterns'],17:['술집 지하의 소동','Ruckus Beneath the Saloon'],18:['마을 거리의 추격전','Pursuit down Main Street'],19:['마을 시계탑의 경보','Alarm at the Town Clock'],20:['무법자 잭의 결전','Showdown with Outlaw Jack'],
  21:['마을 광장의 소문','Rumors in the Town Square'],22:['쌍둥이 술집의 그림자','Shadows of the Twin Saloons'],23:['보안관 사무실의 방패벽','Shieldwall at the Sheriff’s Office'],24:['골목길 매복','Ambush in Back Alley'],25:['잭의 마을 봉쇄','Jack Locks Down the Town'],
  26:['은행 앞의 속삭임','Whispers Outside the Bank'],27:['호텔 복도의 등불','Lanterns in the Hotel Hall'],28:['수정 상점의 파편 폭풍','Shard Squall at the Crystal Shop'],29:['마을 회관의 공명','Resonance in Town Hall'],30:['은행 금고의 수호자','Guardian of the Bank Vault'],
  31:['급행열차의 외곽 순찰','Express Train Patrol'],32:['기관차 첨탑의 불빛','Lights on the Locomotive Spire'],33:['객차 안의 난전','Scramble Through the Passenger Cars'],34:['철로 근위대의 돌격','Charge of the Rail Guard'],35:['기관사의 왕좌','The Conductor’s Throne'],
  36:['잿빛 새벽 열차','Train at Ashen Dawn'],37:['메마른 선로 바닥','The Dry Railbed'],38:['유성우 아래 야간열차','Night Train beneath the Meteor Shower'],39:['철로를 울리는 무거운 발걸음','Heavy Footsteps on the Rails'],40:['붉은 기관차의 재대결','Red Locomotive Rematch'],
  41:['종착역의 경보','Alarm at the Terminal'],42:['식당칸의 비밀','Secret in the Dining Car'],43:['역무원의 포위망','The Stationmaster’s Encirclement'],44:['화물칸 금고의 수문장','Vaultkeeper in the Freight Car'],45:['검은 깃발 급행','The Black Banner Express'],
  56:['붉은 협곡의 돌기둥 길','Pillar Path in Red Canyon'],57:['관문을 지키는 광부들','Miners Guarding the Gate'],58:['붉은 불꽃의 광맥','Redfire Vein'],59:['협곡 지하수의 거수','Behemoth Beneath the Canyon'],60:['관문 깊은 곳의 맥동','Pulse Deep in the Gate'],
  61:['서쪽 절벽의 횃불','Torches on the West Cliffs'],62:['관문을 지키는 사냥개','Hounds at the Gate'],63:['협곡 회관의 난입','Raid on the Canyon Hall'],64:['붉은 갑옷의 망령','Wraith in Red Armor'],65:['협곡의 검은 깃발','Black Standard of the Canyon'],
  66:['수정 광산의 횃불','Torches in the Crystal Mine'],67:['광맥 끝에서 울린 총성','A Shot from the Vein’s End'],68:['수정 파편 소용돌이','Whirlwind of Crystal Shards'],69:['광산 통로의 추격자들','Pursuers in the Mine Shafts'],
  72:['녹슨 갱도의 메아리','Echoes in the Rusted Shaft'],73:['한낮의 광산 총격전','Noon Shootout in the Mine'],74:['무너진 갱도의 무리','Horde at the Collapsed Shaft'],75:['광산 심층의 군주','Lord of the Deep Mine'],
  76:['북쪽 갱도의 길잡이','Guide to the Northern Shaft'],77:['수정 광맥의 폭우','Downpour in the Crystal Vein'],78:['유성 수정의 그림자','Shadows of Meteorite Crystal'],80:['광산의 철갑 심판','Iron Judgment in the Mine'],
  81:['황혼 요새의 긴 그림자','Long Shadow of the Twilight Citadel'],82:['요새 폐마차의 역습','Counterattack at the Citadel Wreck'],83:['검은 깃발 돌격대','Black Banner Raiders'],84:['황혼 요새의 거수','Citadel Behemoth at Dusk'],85:['황혼 군주의 결전','Showdown with the Dusk Lord'],
  86:['요새의 검은 협곡','Black Canyon of the Citadel'],87:['요새 광부 야영지','Citadel Miners’ Camp'],88:['황혼 수정비','Twilight Crystal Rain'],89:['요새 철문을 두드리는 거수','Behemoth at the Citadel Iron Door'],90:['황혼 요새의 수정 골렘','Crystal Golem of the Twilight Citadel'],
  91:['요새 아래의 장터길','Market Road below the Citadel'],92:['까마귀 망루의 경보','Alarm at Ravenwatch'],
  100:['마지막 결전: 황야의 새벽','Final Duel: Dawn of the Wilds'],
};
const weaponNotes:Record<Plan['style'],[string,string]>={
  scout:['리볼버로 약한 적을 정리하고, 라이플은 관통이 필요한 순간에 선택하세요.','Use the revolver for light foes and switch to the rifle when piercing matters.'],
  rush:['빠른 적이 많으니 개틀링을 선택하고, 가까운 무리에는 산탄총을 쓰세요.','Choose the gatling for runners and the shotgun for nearby groups.'],
  swarm:['밀집한 적은 산탄총이나 다이너마이트로 한꺼번에 상대하세요.','Use the shotgun or dynamite to handle clustered enemies at once.'],
  brute:['튼튼한 적에게 라이플을 선택하고, 다이너마이트로 큰 피해를 더하세요.','Choose the rifle against brutes and add dynamite for heavy damage.'],
  mixed:['개틀링으로 무리를 줄이고, 라이플로 튼튼한 적을 상대하세요.','Thin crowds with the gatling and use the rifle against tough foes.'],
  boss:['대장전에는 라이플과 다이너마이트를 번갈아 선택해 큰 피해를 누적하세요.','During the boss duel, alternate the rifle and dynamite for sustained heavy damage.'],
};
const weightsByStyle:Record<Plan['style'],readonly number[]>={
  scout:[.72,.16,.04,.08],rush:[.27,.52,.06,.15],swarm:[.32,.17,.08,.43],
  brute:[.3,.18,.36,.16],mixed:[.34,.29,.15,.22],boss:[.28,.24,.2,.28],
};
const laneSets=[[350,382],[350,378,405],[360,392,414],[375],[348,370,394,416]] as const;
const authored=plans.map((plan,i)=>{
  const chapterIndex=chapterEnds.findIndex(end=>i<end);
  const chapterStart=chapterIndex===0?0:chapterEnds[chapterIndex-1];
  const local=i-chapterStart,phase=i%5,boss=phase===4;
  const finale=i===99;
  const chapterProgress=chapterIndex/5;
  const quota=finale?20:Math.round(7+chapterProgress*4+phase*1.2+(i%3===1?1:0));
  const interval=finale?900:Math.min(1800,Math.round(1780-chapterProgress*330-phase*95+(i%4)*55));
  const hp=Number((0.78+chapterProgress*.25+phase*.035+(i%4)*.025).toFixed(3));
  const lanes=laneSets[(chapterIndex+Math.floor(local/5)+phase)%laneSets.length];
  const bossHp=boss?Math.round((360+chapterIndex*38+Math.floor(i/5)*7)*(finale?1.18:1)):0;
  const [koWeapon,enWeapon]=weaponNotes[plan.style];
  const chapter=CHAPTERS[chapterIndex],title=titleOverrides[i+1];
  const titleKo=title?.[0]??plan.name,titleEn=title?.[1]??plan.nameEn;
  const weights=finale?[.22,.25,.23,.3]:[...weightsByStyle[plan.style]];
  return {...plan,name:titleKo,nameEn:titleEn,hint:`${plan.hint} ${koWeapon}`,hintEn:`${plan.hintEn} ${enWeapon}`,index:i,chapterIndex,boss,quota,interval,weights,lanes:[...lanes],hp,bossHp};
});

export function levelFor(wave:number) {
  const safeWave=Number.isFinite(wave)?Math.max(1,Math.floor(wave)):1;
  const index=(safeWave-1)%100,cycle=Math.floor((safeWave-1)/100),entry=authored[index];
  const chapter=CHAPTERS[entry.chapterIndex];
  // The loop scales slowly and caps at +30%; weapon damage remains fixed.
  const loopScale=1+Math.min(cycle,3)*.1;
  return {...entry,chapter,cycle,quota:Math.round(entry.quota+Math.min(cycle,3)),
    interval:Math.max(700,Math.round(entry.interval*(1-Math.min(cycle,3)*.035))),
    hp:Number((entry.hp*loopScale).toFixed(3)),bossHp:entry.boss?Math.round(entry.bossHp*loopScale):0};
}

const cache = new Map<string,HTMLCanvasElement>();
function scenery(chapter:typeof CHAPTERS[number]):HTMLCanvasElement {
  const canvas=document.createElement('canvas');canvas.width=800;canvas.height=500;const c=canvas.getContext('2d')!;
  const rect=(x:number,y:number,w:number,h:number,color:string,r=0)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
  const poly=(points:number[][],color:string)=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
  const oval=(x:number,y:number,rx:number,ry:number,color:string)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
  const sky=c.createLinearGradient(0,0,0,365);chapter.sky.forEach((color,i)=>sky.addColorStop(i/2,color));c.fillStyle=sky;c.fillRect(0,0,800,500);
  oval(650,91,39,39,chapter.id==='mesa'?'#ffe3b0':'#e3ecdc');
  for(let i=0;i<20;i++)oval((i*83+31)%800,30+(i*47)%170,1,1,'#fff3dc88');
  poly([[0,290],[80,184],[170,256],[245,164],[340,270],[445,189],[560,269],[670,178],[800,246],[800,360],[0,360]],chapter.far);
  poly([[0,330],[130,246],[260,310],[400,232],[570,303],[710,230],[800,278],[800,365],[0,365]],chapter.near);
  if(chapter.id==='mesa') {
    for(const [x,y,w,h] of [[230,180,85,160],[470,140,110,200],[685,225,60,115]]){poly([[x,y+h],[x+7,y+20],[x+25,y],[x+w-14,y],[x+w,y+40],[x+w-5,y+h]],'#b77d76');rect(x+20,y+29,w-30,9,'#dda68a',3);rect(x+9,y+70,w-10,6,'#925d68');}
    for(const x of [38,172,620,765]){rect(x,282,10,65,'#486762',5);rect(x-15,302,22,8,'#486762',4);rect(x-15,285,8,23,'#486762',4);}
  } else if(chapter.id==='town') {
    for(let i=0;i<4;i++){const x=190+i*151,y=230-(i%2)*35;rect(x,y,130,115,'#745061',3);rect(x+9,y+10,112,96,'#aa7880',2);rect(x-4,y-7,138,16,'#503a56',2);rect(x+24,y+28,80,18,'#e2b48d',3);rect(x+49,y+65,33,50,'#3c344b',4);for(const dx of [15,92]){rect(x+dx,y+62,23,26,'#ffce90',2);rect(x+dx+10,y+62,3,26,'#685268');}c.fillStyle='#614655';c.font='bold 9px sans-serif';c.textAlign='center';c.fillText(['SALOON','SHERIFF','GENERAL','HOTEL'][i],x+64,y+41);}
    for(let x=120;x<800;x+=60){rect(x,320,5,30,'#66505c');rect(x,326,60,4,'#a47d80');}
  } else if(chapter.id==='rail') {
    rect(0,285,800,46,'#2b4157');rect(0,327,800,9,'#92adb6');
    for(let i=0;i<6;i++){const x=85+i*135;rect(x,230,122,94,'#49677b',8);rect(x+10,245,102,32,'#aac2be',4);rect(x+58,245,5,32,'#49677b');oval(x+25,324,14,14,'#26364c');oval(x+98,324,14,14,'#26364c');}
    for(const x of [30,410,760]){rect(x,187,7,151,'#35475a');rect(x-12,181,30,10,'#8fa7b3',3);oval(x+3,201,10,15,'#ffdfa1');}
  } else if(chapter.id==='canyon') {
    for(const x of [0,180,620,755]){poly([[x-80,350],[x-72,84],[x-25,40],[x+46,78],[x+63,350]],'#9f6269');for(let y=100;y<330;y+=38)rect(x-70,y,118,6,'#ca8d7c',2);}
    rect(260,170,310,23,'#bd8a83',5);rect(280,190,16,150,'#825668');rect(533,190,16,150,'#825668');for(let x=295;x<535;x+=36)rect(x,194,4,36,'#d5a286');
  } else if(chapter.id==='mine') {
    poly([[0,0],[800,0],[800,165],[740,100],[670,200],[600,85],[510,160],[430,66],[340,171],[240,70],[140,178],[70,92],[0,180]],'#1b2744');rect(330,194,175,150,'#171f38',65);rect(314,180,18,165,'#756d86');rect(505,180,18,165,'#756d86');rect(314,180,209,20,'#948591',3);
    for(const [x,y,h] of [[80,310,78],[220,330,48],[575,320,105],[724,330,65]]){poly([[x-20,y],[x-15,y-h*.65],[x,y-h],[x+19,y-h*.5],[x+24,y]],'#72bfbf');poly([[x,y-h],[x+2,y],[x+24,y]],'#48849f');poly([[x-3,y-h+12],[x-10,y-h*.58],[x+1,y-h*.3]],'#bbf5d8');}
  } else {
    rect(240,185,460,165,'#514564');rect(225,170,490,22,'#8f7897');
    for(const x of [205,365,590,710]){rect(x,110,66,238,'#675775');rect(x-5,98,76,21,'#a18b9c');for(let dx=0;dx<70;dx+=23)rect(x-5+dx,80,14,22,'#a18b9c');rect(x+23,145,20,42,'#ffd6a8',8);rect(x+23,222,20,37,'#3e3653',8);}
    rect(441,240,67,110,'#2d2a46',30);rect(426,203,96,20,'#9e8298',3);for(const x of [310,650]){rect(x,205,6,85,'#ba9a9c');poly([[x+6,205],[x+52,217],[x+6,247]],'#bc697d');}
  }
  const ground=c.createLinearGradient(0,340,0,500);ground.addColorStop(0,chapter.ground);ground.addColorStop(1,chapter.near);c.fillStyle=ground;c.fillRect(0,340,800,160);
  c.fillStyle='#f4d9ba';c.globalAlpha=0.1;c.beginPath();c.ellipse(440,426,510,55,0,0,Math.PI*2);c.fill();c.globalAlpha=1;
  for(let i=0;i<180;i++){const x=(i*127+19)%800,y=352+(i*43)%148;rect(x,y,2+(i%3),1,i%2?'#ffefc533':'#201f3a22',1);}
  for(const x of [8,770]){rect(x,445,26,20,chapter.near,5);rect(x+6,435,11,12,chapter.near,4);}
  return canvas;
}
export function drawWorld(ctx:CanvasRenderingContext2D,level:ReturnType<typeof levelFor>,time:number,reduced:boolean) {
  let backdrop=cache.get(level.chapter.id);if(!backdrop){backdrop=scenery(level.chapter);cache.set(level.chapter.id,backdrop);}
  ctx.drawImage(backdrop,0,0);
  if(!reduced){ctx.save();ctx.globalAlpha=0.22;ctx.fillStyle=level.chapter.accent;for(let i=0;i<12;i++){const x=(i*79+time*7)%820-10,y=160+(i*37)%160+Math.sin(time+i)*9;ctx.beginPath();ctx.arc(x,y,1.5,0,Math.PI*2);ctx.fill();}ctx.restore();}
}
