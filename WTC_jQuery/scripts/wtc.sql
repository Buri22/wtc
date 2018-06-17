-- --------------------------------------------------------
-- Hostitel:                     127.0.0.1
-- Verze serveru:                10.1.30-MariaDB - mariadb.org binary distribution
-- OS serveru:                   Win32
-- HeidiSQL Verze:               9.5.0.5196
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Exportování struktury databáze pro
CREATE DATABASE IF NOT EXISTS `work_time_counter` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `work_time_counter`;

-- Exportování struktury pro tabulka work_time_counter.task
CREATE TABLE IF NOT EXISTS `task` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) COLLATE utf8_czech_ci NOT NULL,
  `LastStart` int(11) DEFAULT NULL,
  `SpentTime` int(11) DEFAULT NULL,
  `TaskStarted` tinyint(1) NOT NULL DEFAULT '0',
  `DateCreated` date NOT NULL,
  `UserId` int(11) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=197 DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci;

-- Exportování dat pro tabulku work_time_counter.task: ~153 rows (přibližně)
/*!40000 ALTER TABLE `task` DISABLE KEYS */;
INSERT INTO `task` (`Id`, `Name`, `LastStart`, `SpentTime`, `TaskStarted`, `DateCreated`, `UserId`) VALUES
	(1, 'Initial test task', 1502800154, 4, 0, '2017-08-16', 7),
	(37, 'SMART WIN design of Login page', 1502883286, 16078, 0, '2017-08-15', 7),
	(38, '#3365 - Přidat css pro nové ikony', 1502890708, 6087, 0, '2017-08-16', 7),
	(39, '#3591 - Chyby po testování', 1502897960, 11598, 0, '2017-08-16', 7),
	(40, 'WTC - Refactoring to jQuery + modal windows for task actions', 1503259996, 19534, 0, '2017-08-16', 7),
	(41, '#3597 - Nejde vkládat položky do košíku', 1502985068, 4111, 0, '2017-08-17', 7),
	(42, '#2722 - Nedodělky - Způsob platby typu Faktura', 1502991595, 1833, 0, '2017-08-17', 7),
	(43, '#2735 - Košík - Dobírka', 1503576733, 40391, 0, '2017-08-17', 7),
	(44, '#3815 - Dodělky 1. vlny - vlaječky v hlavičce', 1503595297, 5112, 0, '2017-08-24', 7),
	(45, '#3826 - Připomínky 2. vlna - Filtrace firem v adminu', 1503601483, 7424, 0, '2017-08-24', 7),
	(46, '#3751 - A-Z Země - Odstranit krátký popis', 1503658320, 3162, 0, '2017-08-25', 7),
	(47, '#3863 - Chyba v Pohledávkách', 1503649660, 5599, 0, '2017-08-25', 7),
	(48, '#3864 - Přizpůsobit pro menší monitory', 1503655342, 1302, 0, '2017-08-25', 7),
	(49, '#3716 - Novinky - Informace o obsahu alkoholu a objemu', 1503666631, 5736, 0, '2017-08-25', 7),
	(50, '#3721 - Košík - Souhrn nákupu', 1503681229, 5493, 0, '2017-08-25', 7),
	(51, '#3899 - Vlaječky zasahují do přihlášení', 1503672205, 1234, 0, '2017-08-25', 7),
	(52, '#3711 - Detail kategorie - Slevové kolečko', 1503686154, 3495, 0, '2017-08-25', 7),
	(53, '#3358 - EWAS - Detail objednávky: Přidat informaci o slevě do výčtu položek', 1503912888, 4418, 0, '2017-08-28', 7),
	(54, '#3339 - Ewas: Řazení zákazníků a objednávek - nejnovější nahoru', 1503920181, 2865, 0, '2017-08-28', 7),
	(55, '#3371 - Weby EN, DE - úprava: Přeložení věty ve vyhledávání', 1503924780, 720, 0, '2017-08-28', 7),
	(56, '#3336 - E-SHOP SK i CZ: Historie objednávek - řazení', 1503925641, 211, 0, '2017-08-28', 7),
	(57, '#3348', 1503925874, 595, 0, '2017-08-28', 7),
	(58, '#3281 - E-SHOP CZ a SK: Objednávkový proces - fakturační údaje - přidat tlačítko', 1503936013, 9527, 0, '2017-08-28', 7),
	(59, '#3934 - 2. vlna: Přidat na web vlaječky pro polštinu a němčinu', 1503941837, 848, 0, '2017-08-28', 7),
	(60, '#4014 - Home Page - Editovatelnost textů a tlačítka', 1503999227, 4933, 0, '2017-08-29', 7),
	(61, '#4018 - Home page   Ceník - Editovatelnost ceny u Koupit vše', 1504007557, 1770, 0, '2017-08-29', 7),
	(62, '#4020 - Home Page   Ceník - Možnost zadávat slevy u balíčků a možnost je editovat', 1504254359, 14332, 0, '2017-08-29', 7),
	(63, '#4027 - Po registraci musí mít uživatel načtený balíček free v uživatelském panelu', 1504086193, 4641, 0, '2017-08-29', 7),
	(64, '#4022 - Home page - Možnost editovat text v Blogabet panelu a opravit chybu', 1504035149, 1043, 0, '2017-08-29', 7),
	(65, '#4024 - Home page - zajistit, aby každý posuvník vypisoval správné hodnoty ', 1504036265, 776, 0, '2017-08-29', 7),
	(66, '#4054', 1504077253, 841, 0, '2017-08-29', 7),
	(67, '#4047', 1504037303, 1410, 0, '2017-08-29', 7),
	(68, '#4042 - Uživatelský profil - změna hesla', 1504189658, 4661, 0, '2017-08-30', 7),
	(69, 'Obnova Smartwin db', 1504264910, 37277, 0, '2017-08-30', 7),
	(70, '#4049', 1504204742, 3695, 0, '2017-08-31', 7),
	(71, '#4062 - Smart Tips a World Experts - Jak se službě daří', 1504207608, 1361, 0, '2017-08-31', 7),
	(72, '#4061 - Sekce WE - ProfitWE: Animace -> Sjet na jak se službě daří', 1504209116, 1150, 0, '2017-08-31', 7),
	(73, '#4051', 1504210416, 1951, 0, '2017-08-31', 7),
	(74, '#4059', 1504212624, 18, 0, '2017-08-31', 7),
	(75, '#4057', 1504212658, 3684, 0, '2017-08-31', 7),
	(76, '#4006 - BUG: Oprava rozbitého vzhledu', 1504510224, 3599, 0, '2017-09-04', 7),
	(77, 'Přípravy na Svatoňovice 2017', 1504723338, 47360, 0, '2017-09-04', 7),
	(78, '#4078 - Scrolování místo stránkování (položek v tabulce)', 1504613469, 12497, 0, '2017-09-05', 7),
	(79, '#4138 - ST, WE: úprava grafu a horní tabulky', 1504620534, 4012, 0, '2017-09-05', 7),
	(80, '#4140 - EWAS: Opravit v detailu zákazníka číslo místo názvu země', 1504865515, 3501, 0, '2017-09-06', 7),
	(81, '#4158 - Pokud při registraci není 18 let, zobrazit stránku s omluvou', 1504703067, 1045, 0, '2017-09-06', 7),
	(82, '#4157 - Oprava sekce Matched betting', 1504712172, 5237, 0, '2017-09-06', 7),
	(83, '#4156 - Oprava sekce Proč sázet s námi', 1504716574, 1898, 0, '2017-09-06', 7),
	(84, 'Opravy Smartwinu dle Word dokumentu', 1504855713, 32475, 0, '2017-09-07', 7),
	(85, '#4149 - Chyba v Představení systému eSpedice', 1504859563, 2571, 0, '2017-09-08', 7),
	(86, '#4188 - V sekci MB chybí v boxíku KalkulačkaMB ikonka', 1506353921, 1583, 0, '2017-09-11', 7),
	(90, 'Mydrinks excel 107', 1506425907, 59747, 0, '2017-09-25', 7),
	(91, '#4396 - Návody: možnost zobrazovat a skrývat tlačítko zobrazit postup', 1506628266, 2523, 0, '2017-09-28', 7),
	(92, '#4091 - Při scrolování se snižuje načítání číselných hodnot - Proč sázet s námi?', 1507792096, 8185, 0, '2017-09-28', 7),
	(93, '#4434 - MB: Free sekce, Placená sekce, Opakované bonusy - úprava vzhledu', 1506674276, 10850, 0, '2017-09-28', 7),
	(94, 'Smartwin - refactoring aside_nav   Page breadcrumb', 1506684332, 3373, 0, '2017-09-29', 7),
	(95, '#4430 - Mám vůz, Mám náklad - Názvy položek v tabulce upravit dle názvů ve filtru', 1507796956, 585, 0, '2017-09-29', 7),
	(96, '#4473 - Oprava struktury webu v administraci -> Free, Paid sekce, Opakované bonusy   Doplneni metadat Titulek', 1507796963, 8223, 0, '2017-10-03', 7),
	(97, '#4490 - Úprava zobrazení produktů v kategorii', 1507207461, 113989, 0, '2017-10-05', 7),
	(98, 'WTC - Refactor localStorage ticking time', 1507403073, 58913, 0, '2017-10-06', 7),
	(99, 'New TaskList   all actions and new pagination', NULL, NULL, 0, '2017-10-12', 7),
	(100, 'WTC - Refactor TaskList with actions and pagination', 1507792081, 31586, 0, '2017-10-12', 7),
	(103, 'WTC - Refactoring Counter.js to separate Tasks model', 1507797024, 14411, 0, '2017-10-12', 7),
	(104, 'Mydrinks - Oprava designu Kosiku - zpusoby dodani a platby', 1507811572, 2798, 0, '2017-10-12', 7),
	(105, 'WTC - create itemsPerPage property to edit num of items per page', 1507883837, 46362, 0, '2017-10-12', 7),
	(106, 'umyvanie riadu', 1508405805, 7253, 0, '2017-10-13', 7),
	(107, 'Mydrinks - mapovani oblasti a zemi', 1508498040, 18279, 0, '2017-10-17', 7),
	(108, 'WTC - when editing ticking task, we want to show time when modal window was open', 1508314764, 2548, 0, '2017-10-17', 7),
	(109, 'WTC - Create and Edit modal can input spent time and date created - implement datepicker', 1508402391, 9265, 0, '2017-10-18', 7),
	(110, 'Mydrinks - Finální kodérské úpravy 3', 1508413252, 38030, 0, '2017-10-18', 7),
	(111, 'WTC - Create App Settings', 1509987220, 26550, 0, '2017-10-19', 7),
	(112, 'Mydrinks - Kodérské úpravy 4', 1508493083, 1802, 0, '2017-10-20', 7),
	(113, '4602 - Opravit změnu datumu zápasu', 1508504282, 3047, 0, '2017-10-20', 7),
	(114, '4603 - Opravit odkaz v menu', 1508748031, 4648, 0, '2017-10-20', 7),
	(115, '4618 - WEB: Přehled knih - Detail knihy - Přidat Metadata', 1508849693, 6207, 0, '2017-10-24', 7),
	(116, '4620 - EWAS: Řadit všechny články a webové stránky podle abecedy', 1508853720, 953, 0, '2017-10-24', 7),
	(117, '4628 - EWAS: Vytvořit možnost hromadného mazání (check boxy)', 1508932819, 17409, 0, '2017-10-24', 7),
	(118, '4663 - Oprava objednávkového procesu', 1509029423, 10038, 0, '2017-10-25', 7),
	(119, '4667 - Editovatelný telefonický kontakt a ičo v patičce (Jako text webu)', 1508946949, 295, 0, '2017-10-25', 7),
	(121, '4624 - EWAS: Bug ve vyhledávání', 1509014127, 2145, 0, '2017-10-26', 7),
	(122, '4643 - WEB, EWAS: Možnost vybírat si vzhled stránky (přes metadata)', 1509380932, 24010, 0, '2017-10-26', 7),
	(123, '4718 - Sdílení na FB - 14 dní zdarma - hází error místo stránky uživatelského panelu', 1509465266, 5136, 0, '2017-10-31', 7),
	(124, 'SpokojenyMazlicek - rozchodenie vývojového prostredia + oprava bugu', 1509566883, 39865, 0, '2017-11-01', 7),
	(125, '4630 - E-SHOP: Vytvořit možnost, aby si mohl uživatel smazat vlastní účet na e-shopu', 1509634143, 12155, 0, '2017-11-02', 7),
	(126, '4716 - Implementace filtrování ve výběru článků', 1509957513, 5410, 0, '2017-11-06', 7),
	(127, '4745 - Naklonovat data pro nový web', 1510145150, 16553, 0, '2017-11-06', 7),
	(128, 'Administrace - 6.11.2017', 1509967567, 800, 0, '2017-11-06', 7),
	(129, '4748 - Upravit počet desetinným míst u Profitu', 1509968434, 928, 0, '2017-11-06', 7),
	(130, '4746 - Zápasy s časem s nulou na začátku se nepropisují na web', 1509985448, 1571, 0, '2017-11-06', 7),
	(131, '4750 - Při nákupu balíčku se propisuje balíček WE 2x v uživatelském panelu na webu', 1509996700, 9258, 0, '2017-11-06', 7),
	(132, '4754 - Podmínění nákupu balíčku přihlášením na webu', 1510132020, 3905, 0, '2017-11-07', 7),
	(133, 'Administrace - 7.11.2017', 1510073194, 2360, 0, '2017-11-07', 7),
	(134, 'Vytvoreni databazove klonovaci aplikace', 1510089135, 12547, 0, '2017-11-07', 7),
	(135, '4762 - Designové úpravy nového webu', 1510166564, 10760, 0, '2017-11-08', 7),
	(136, 'Administrace - 8.11.2017', 1510161889, 4456, 0, '2017-11-08', 7),
	(137, '4763 - Po zakoupení balíčku nejsou přístupné premium nástroje v sekci Co balíček obsahuje', 1510225530, 3967, 0, '2017-11-09', 7),
	(138, '4764 - Vytvořit claim na Home page', 1510219974, 2159, 0, '2017-11-09', 7),
	(139, 'Administrace - 9.11.2017', 1510260834, 6217, 0, '2017-11-09', 7),
	(140, 'EWAS-RD - Vytvorit funkcionalitu hromadneho odesilani mailu pomoci mailgun', 1510570391, 16378, 0, '2017-11-09', 7),
	(141, '4766 - Chyba při odhlašování', 1510259715, 1953, 0, '2017-11-09', 7),
	(142, '4769 - Uprava mailing údajů + změna loga', 1510564318, 4312, 0, '2017-11-10', 7),
	(143, '4768 - Chyba při odhlašování na klub.suri.cz a slevyapoukazy.cz', 1510325021, 4071, 0, '2017-11-10', 7),
	(144, '4771 - Změna Linku', 1518355340, 1640, 0, '2017-11-13', 7),
	(145, 'CodeSchool - Javascript', 1510817022, 21849, 0, '2017-11-13', 7),
	(147, 'IT-Network - doplneni PHP manualu', 1513365508, 29808, 0, '2017-12-15', 7),
	(148, 'ITNetwork - preklad článku "1. díl - Úvod do testování webových aplikací v PHP"', 1519058890, 19413, 0, '2018-01-25', 7),
	(149, 'ITNetwork - 2. článek', 1518515498, 9357, 0, '2018-02-09', 7),
	(150, 'ITNetwork - 3. článek', 1518517220, 5905, 0, '2018-02-09', 7),
	(151, 'ITNetwork - 4. článek', 1518518470, 8715, 0, '2018-02-10', 7),
	(152, 'ITNetwork - 5. článek', 1518520302, 8679, 0, '2018-02-10', 7),
	(153, 'ITNetwork - 6. článek', 1518524134, 8625, 0, '2018-02-10', 7),
	(155, 'GalantéDia - tvorba základu', 1519581033, 6613, 0, '2018-02-25', 7),
	(156, 'GalantéDia - výber template + tvorba meníčka', 1521364090, 29333, 0, '2018-02-28', 7),
	(157, 'ITNetwork - 7. článek', 1520269099, 8892, 0, '2018-03-01', 7),
	(158, 'ITNetwork - 8. článek', 1520271940, 7856, 0, '2018-03-02', 7),
	(159, 'ITNetwork - 9. článek', 1520273881, 8892, 0, '2018-03-03', 7),
	(160, 'ITNetwork - 10. článek', 1520275028, 4645, 0, '2018-03-04', 7),
	(161, 'Slovenský Jazyk testy', NULL, 0, 0, '2018-03-06', 8),
	(162, 'Anglický Jazyk testy', NULL, 0, 0, '2018-03-06', 8),
	(163, 'mojo dojo', 1520936118, 7, 0, '2018-03-13', 9),
	(164, 'ITNetwork - 11. článek', 1523048441, 6315, 0, '2018-03-29', 7),
	(165, 'ITNetwork - 12. článek', 1523050273, 6081, 0, '2018-03-31', 7),
	(166, 'ITNetwork - 13. článek', 1523205296, 13312, 0, '2018-04-01', 7),
	(167, 'ITNetwork - 14. článek', 1523209226, 10665, 0, '2018-04-01', 7),
	(168, 'Eria - Agenda', NULL, 3960, 0, '2018-04-03', 7),
	(169, 'ITNetwork - 15. článek', 1523257540, 11089, 0, '2018-04-03', 7),
	(170, 'ITNetwork - 16. článek', 1523258326, 6696, 0, '2018-04-04', 7),
	(171, 'Eria - 5.4.2018', 1522937198, 35464, 0, '2018-04-05', 7),
	(172, 'Eria - 6.4.2018', 1523005034, 17461, 0, '2018-04-06', 7),
	(173, 'Eria - 9.4.2018', 1523300230, 19192, 0, '2018-04-09', 7),
	(174, 'Eria - 10.4.2018', 1523383447, 51546, 0, '2018-04-10', 7),
	(175, 'Eria - 11.4.2018', 1523460830, 31624, 0, '2018-04-11', 7),
	(176, 'Eria - 12.4.2018', 1523557544, 12750, 0, '2018-04-12', 7),
	(177, 'Eria - 13.4.2018', 1523638009, 32750, 0, '2018-04-13', 7),
	(178, 'Eria - 14.4.2018', 1523733129, 33191, 0, '2018-04-14', 7),
	(179, 'Eria - 16.4.2018', 1523909016, 19307, 0, '2018-04-16', 7),
	(180, 'Eria - 17.4.2018', 1523991834, 34598, 0, '2018-04-17', 7),
	(181, 'Eria - 18.4.2018', 1524082616, 51513, 0, '2018-04-18', 7),
	(182, 'Eria - 19.4.2018', NULL, 12600, 0, '2018-04-19', 7),
	(183, 'Eria - 20.4.2018', 1524241682, 26463, 0, '2018-04-20', 7),
	(184, 'ITNetwork - 17. článek', 1525010784, 9211, 0, '2018-04-20', 7),
	(185, 'ITNetwork - 18. článek', 1525013866, 17072, 0, '2018-04-22', 7),
	(186, 'Eria - 23.4.2018', 1524512498, 14686, 0, '2018-04-23', 7),
	(187, 'Eria - 24.4.2018', 1524599382, 43255, 0, '2018-04-24', 7),
	(188, 'Eria - 25.4.2018', 1524671258, 16452, 0, '2018-04-25', 7),
	(189, 'ITNetwork - 19. článek', 1525028671, 10505, 0, '2018-04-26', 7),
	(190, 'Eria - 27.4.2018', 1524912946, 12429, 0, '2018-04-27', 7),
	(191, 'ITNetwork - 20. článek', 1525030088, 11057, 0, '2018-04-27', 7),
	(192, 'ITNetwork - 21. článek', 1525031825, 10585, 0, '2018-04-28', 7),
	(193, 'ITNetwork - 22. článek', 1525033216, 6408, 0, '2018-04-28', 7),
	(194, 'ITNetwork - 23. článek', 1525034440, 7129, 0, '2018-04-29', 7),
	(195, 'Eria - 30.4.2018', 1525117380, 24868, 0, '2018-04-30', 7),
	(196, 'Eria - 1.5.2018', 1527198271, 11471, 0, '2018-05-01', 7);
/*!40000 ALTER TABLE `task` ENABLE KEYS */;

-- Exportování struktury pro tabulka work_time_counter.user
CREATE TABLE IF NOT EXISTS `user` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `UserName` varchar(30) COLLATE utf8_czech_ci NOT NULL DEFAULT '#',
  `Password` char(128) COLLATE utf8_czech_ci NOT NULL DEFAULT '#',
  `Email` varchar(50) COLLATE utf8_czech_ci NOT NULL DEFAULT '#',
  `LoginAttempts` tinyint(4) NOT NULL DEFAULT '0',
  `LastAttempt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `AppSettings` text COLLATE utf8_czech_ci NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci;

-- Exportování dat pro tabulku work_time_counter.user: ~5 rows (přibližně)
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` (`Id`, `UserName`, `Password`, `Email`, `LoginAttempts`, `LastAttempt`, `AppSettings`) VALUES
	(4, '#', '#', '#', 0, '2017-09-25 14:48:21', '{"theme":{"color":"green"},"sideMenu":{"active":true,"position":"left"}}'),
	(6, 'Hajk', '$2y$10$bsytVtMZwHSUtjOApHSd8eHi1K/2KI5/hb/zV7wFTRkg7ZIbc0r7y', 'hajk@eria.cz', 2, '0000-00-00 00:00:00', '{"theme":{"color":"green"},"sideMenu":{"active":true,"position":"left"}}'),
	(7, 'Baltazar', '$2y$10$71Q10q3XwdaD2PQ52ytkIOSdyifPtXLP7U5XKQLIUX46OAfkgFMBG', 'martinburza22@gmail.com', 5, '0000-00-00 00:00:00', '{"theme":{"color":"purple"},"sideMenu":{"active":true,"position":"left"}}'),
	(8, 'Petrík', '$2y$10$qpKIMwWlWYPxkjGH3LUuJuBtgrhEIiSk11mQcaSwDzTJw32Pc1eRm', 'peterburza48@gmail.com', 4, '0000-00-00 00:00:00', '{"theme":{"color":"green"},"sideMenu":{"active":true,"position":"left"}}'),
	(9, 'dodo', '$2y$10$waZ8kwnQrMMGqEBIq9/KvOYfgxS8cjZ2ny6MlaoolpPFIUyyE/esK', 'vesecky.adam@gmail.com', 1, '0000-00-00 00:00:00', '{"theme":{"color":"green"},"sideMenu":{"active":true,"position":"left"}}'),
	(10, 'Tester', '$2y$10$Xj9xvxEjSTZ1Q38x.Bd/MOgaObPCpW.bGGGP./kggnUUtA3fdsy.e', 'martinburza@outlook.cz', 3, '0000-00-00 00:00:00', '{"theme":{"color":"green"},"sideMenu":{"active":true,"position":"left"}}');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
