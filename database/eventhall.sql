SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `eventhall`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_applications`
--

DROP TABLE IF EXISTS `admin_applications`;
CREATE TABLE `admin_applications` (
  `id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `motivation_text` text NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `reviewed_by_user_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
  `id` varchar(255) NOT NULL,
  `description` longtext NOT NULL,
  `date` date DEFAULT NULL,
  `time` varchar(20) NOT NULL,
  `location` varchar(500) NOT NULL,
  `district` varchar(255) NOT NULL,
  `Maps_link` varchar(500) DEFAULT NULL,
  `entry_fee` varchar(255) DEFAULT NULL,
  `is_free` tinyint(1) DEFAULT 0,
  `prize_details` text DEFAULT NULL,
  `contact_email` varchar(255) NOT NULL,
  `contact_phone` varchar(20) NOT NULL,
  `external_registration_link` varchar(500) DEFAULT NULL,
  `registration_method` enum('EXTERNAL','FORM') DEFAULT 'EXTERNAL',
  `how_to_register_link` varchar(500) DEFAULT NULL,
  `instagram_url` varchar(500) DEFAULT NULL,
  `facebook_url` varchar(500) DEFAULT NULL,
  `youtube_url` varchar(500) DEFAULT NULL,
  `banner_url` varchar(500) DEFAULT NULL,
  `status` enum('DRAFT','PENDING_APPROVAL','PUBLISHED','REJECTED','ARCHIVED') DEFAULT 'DRAFT',
  `is_featured` tinyint(1) DEFAULT 0,
  `featured_at` timestamp NULL DEFAULT NULL,
  `featured_by` varchar(255) DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_by_id` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `reviewed_by` varchar(255) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `archived_at` timestamp NULL DEFAULT NULL,
  `archived_by` varchar(255) DEFAULT NULL,
  `published_at` timestamp NULL DEFAULT NULL,
  `published_by` varchar(255) DEFAULT NULL,
  `unpublished_at` timestamp NULL DEFAULT NULL,
  `unpublished_by` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` VALUES
('5a89wm1765456362587', 'wqeiorh', NULL, '19:02', 'Cherukunnu', 'Kozhikode', NULL, NULL, 1, NULL, 'alkdfj@gmail.com', '1232132131', NULL, 'FORM', NULL, NULL, NULL, NULL, NULL, 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 12:32:42', '2025-12-11 13:20:21', 'uadmin-1', '2025-12-11 12:33:02', NULL, NULL, NULL, NULL, NULL, NULL),
('conf-002', 'Digital India Summit 2025', '2025-12-15', '09:00 AM', 'Grand Hall, Convention Center, Kochi', 'Ernakulam', 'https://maps.google.com/grand-hall-kochi', '???3,999', 0, 'Conference pass, meals, and networking opportunities', 'india@eventhall.com', '+91-9876543228', 'https://eventhall.com/register/conf-002', 'EXTERNAL', 'https://eventhall.com/register/conf-002', '@digitalindia', 'facebook.com/digitalindia', 'youtube.com/digitalindia', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('conf-004', 'Blockchain & Web3 Global Forum', '2025-12-20', '09:00 AM', 'Tech Summit Hall, Convention Zone, Thrissur', 'Thrissur', 'https://maps.google.com/tech-summit-thrissur', '???5,999', 0, 'Digital assets, workshops, and VIP networking', 'blockchain@eventhall.com', '+91-9876543230', 'https://eventhall.com/register/conf-004', 'EXTERNAL', 'https://eventhall.com/register/conf-004', '@blockchainweb3', 'facebook.com/blockchainweb3', 'youtube.com/blockchainweb3', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('conf-005', 'Python Developers Conference', '2025-12-25', '09:00 AM', 'Dev Center, Developer Campus, Kozhikode', 'Kozhikode', 'https://maps.google.com/dev-center-kozhikode', '???2,999', 0, 'Conference badge and developer materials', 'pythonconf@eventhall.com', '+91-9876543231', 'https://eventhall.com/register/conf-005', 'EXTERNAL', 'https://eventhall.com/register/conf-005', '@pythonconf', 'facebook.com/pythonconf', 'youtube.com/pythonconf', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', 'PUBLISHED', 1, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('cult-001', 'Classical Dance Fest 2025', '2025-12-18', '06:00 PM', 'Cultural Hall, Arts Center, Thiruvananthapuram', 'Thiruvananthapuram', 'https://maps.google.com/cultural-hall-tvpm', 'Free', 1, 'Complimentary dinner and drinks', 'dance@eventhall.com', '+91-9876543241', 'https://eventhall.com/register/cult-001', 'EXTERNAL', 'https://eventhall.com/register/cult-001', '@classicaldancefest', 'facebook.com/classicaldancefest', 'youtube.com/classicaldancefest', 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', 'PUBLISHED', 1, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('cult-002', 'Theatre Festival 2025', '2025-12-19', '07:00 PM', 'Theater Complex, Drama Hub, Kochi', 'Ernakulam', 'https://maps.google.com/theater-complex-kochi', '???300', 0, 'Program booklet and refreshments', 'theatre@eventhall.com', '+91-9876543242', 'https://eventhall.com/register/cult-002', 'EXTERNAL', 'https://eventhall.com/register/cult-002', '@theatrefestival', 'facebook.com/theatrefestival', 'youtube.com/theatrefestival', 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('cult-003', 'Art Exhibition & Workshop', '2025-12-21', '10:00 AM', 'Art Gallery, Creative Space, Kottayam', 'Kottayam', 'https://maps.google.com/art-gallery-kottayam', 'Free', 1, 'Art materials and workshop certificate', 'art@eventhall.com', '+91-9876543243', 'https://eventhall.com/register/cult-003', 'EXTERNAL', 'https://eventhall.com/register/cult-003', '@artexhibition', 'facebook.com/artexhibition', 'youtube.com/artexhibition', 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80', 'PUBLISHED', 1, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('cult-004', 'Heritage Trail & Cultural Tour', '2025-12-22', '08:00 AM', 'Heritage Center, Tourism Hub, Kozhikode', 'Kozhikode', 'https://maps.google.com/heritage-center-kozhikode', '???1,500', 0, 'Lunch, entry fees, and souvenir', 'heritage@eventhall.com', '+91-9876543244', 'https://eventhall.com/register/cult-004', 'EXTERNAL', 'https://eventhall.com/register/cult-004', '@heritagetour', 'facebook.com/heritagetour', 'youtube.com/heritagetour', 'https://images.unsplash.com/photo-1488749807830-63789f68bb65?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 01:46:44', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('cult-005', 'Onam Celebrations 2025', '2025-12-23', '05:00 PM', 'Community Ground, Festival Venue, Thrissur', 'Thrissur', 'https://maps.google.com/community-ground-thrissur', 'Free', 1, 'Traditional feast and cultural merchandise', 'onam@eventhall.com', '+91-9876543245', 'https://eventhall.com/register/cult-005', 'EXTERNAL', 'https://eventhall.com/register/cult-005', '@onamfest', 'facebook.com/onamfest', 'youtube.com/onamfest', 'https://images.unsplash.com/photo-1549887534-7e9e1a5e1b1f?w=800&q=80', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 01:46:44', '2025-12-11 02:56:11', NULL, NULL, NULL, NULL, '2025-12-11 01:46:44', 'admin-1', NULL, NULL),
('e83nu51765430086915', 'hello', NULL, '10:42', 'MES College', 'Kannur', NULL, '599', 0, NULL, 'shad@gmail.com', '1233123123', NULL, 'EXTERNAL', NULL, NULL, NULL, NULL, 'https://i.ibb.co/mCh1Q2Nn/momos-v.jpg', 'PUBLISHED', 0, NULL, NULL, NULL, 'admin-1', '2025-12-11 05:14:46', '2025-12-11 05:15:07', 'uadmin-1', '2025-12-11 05:15:07', NULL, NULL, NULL, NULL, NULL, NULL);

DROP TABLE IF EXISTS `event_categories`;
CREATE TABLE `event_categories` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `event_categories` (`id`, `name`, `slug`, `description`, `created_at`, `updated_at`) VALUES
('1', 'Hackathons', 'hackathons', 'Coding competitions and marathons', '2025-12-11 00:48:55', '2025-12-11 00:48:55'),
('2', 'Workshops', 'workshops', 'Technical and skill-building workshops', '2025-12-11 00:48:55', '2025-12-11 00:48:55'),
('3', 'Conferences', 'conferences', 'Tech talks and conferences', '2025-12-11 00:48:55', '2025-12-11 00:48:55'),
('4', 'Seminars', 'seminars', 'Expert seminars and lectures', '2025-12-11 00:48:55', '2025-12-11 00:48:55'),
('5', 'Sports', 'sports', 'Sports events and competitions', '2025-12-11 00:48:55', '2025-12-11 00:48:55'),
('6', 'Cultural', 'cultural', 'Cultural programs and performances', '2025-12-11 00:48:55', '2025-12-11 00:48:55'),
('7', 'Music & Arts', 'music-arts', 'Music concerts and art exhibitions', '2025-12-11 00:48:55', '2025-12-11 00:48:55'),
('8', 'Gaming', 'gaming', 'Gaming tournaments and esports', '2025-12-11 00:48:55', '2025-12-11 00:48:55');

DROP TABLE IF EXISTS `event_category_links`;
CREATE TABLE `event_category_links` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` varchar(255) NOT NULL,
  `category_id` varchar(255) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `primary_event_id` varchar(255) GENERATED ALWAYS AS (case when `is_primary` then `event_id` end) STORED,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `event_category_links` (`id`, `event_id`, `category_id`, `is_primary`, `created_at`) VALUES
(1, 'e83nu51765430086915', '1', 1, '2025-12-11 05:36:40'),
(2, 'hack-001', '1', 1, '2025-12-11 05:36:40'),
(3, 'hack-002', '1', 1, '2025-12-11 05:36:40'),
(4, 'hack-003', '1', 1, '2025-12-11 05:36:40'),
(5, 'hack-004', '1', 1, '2025-12-11 05:36:40'),
(6, 'hack-005', '1', 1, '2025-12-11 05:36:40'),
(7, 'xt9xb1765428398624', '1', 1, '2025-12-11 05:36:40'),
(8, 'ws-001', '2', 1, '2025-12-11 05:36:40'),
(9, 'ws-002', '2', 1, '2025-12-11 05:36:40'),
(10, 'ws-003', '2', 1, '2025-12-11 05:36:40'),
(11, 'ws-004', '2', 1, '2025-12-11 05:36:40'),
(12, 'ws-005', '2', 1, '2025-12-11 05:36:40'),
(14, 'conf-002', '3', 1, '2025-12-11 05:36:40'),
(16, 'conf-004', '3', 1, '2025-12-11 05:36:40'),
(17, 'conf-005', '3', 1, '2025-12-11 05:36:40'),
(18, 'sem-001', '4', 1, '2025-12-11 05:36:40'),
(19, 'sem-002', '4', 1, '2025-12-11 05:36:40'),
(20, 'sem-003', '4', 1, '2025-12-11 05:36:40'),
(21, 'sem-004', '4', 1, '2025-12-11 05:36:40'),
(22, 'sem-005', '4', 1, '2025-12-11 05:36:40'),
(23, 'sport-001', '5', 1, '2025-12-11 05:36:40'),
(24, 'sport-002', '5', 1, '2025-12-11 05:36:40'),
(25, 'sport-003', '5', 1, '2025-12-11 05:36:40'),
(26, 'sport-004', '5', 1, '2025-12-11 05:36:40'),
(27, 'sport-005', '5', 1, '2025-12-11 05:36:40'),
(28, 'cult-001', '6', 1, '2025-12-11 05:36:40'),
(29, 'cult-002', '6', 1, '2025-12-11 05:36:40'),
(30, 'cult-003', '6', 1, '2025-12-11 05:36:40'),
(31, 'cult-004', '6', 1, '2025-12-11 05:36:40'),
(32, 'cult-005', '6', 1, '2025-12-11 05:36:40'),
(33, 'music-001', '7', 1, '2025-12-11 05:36:40'),
(34, 'music-002', '7', 1, '2025-12-11 05:36:40'),
(35, 'music-003', '7', 1, '2025-12-11 05:36:40'),
(36, 'music-004', '7', 1, '2025-12-11 05:36:40'),
(37, 'music-005', '7', 1, '2025-12-11 05:36:40'),
(38, 'game-001', '8', 1, '2025-12-11 05:36:40'),
(39, 'game-002', '8', 1, '2025-12-11 05:36:40'),
(40, 'game-003', '8', 1, '2025-12-11 05:36:40'),
(41, 'game-004', '8', 1, '2025-12-11 05:36:40'),
(42, 'game-005', '8', 1, '2025-12-11 05:36:40'),
(43, 'e83nu51765430086915', '2', 0, '2025-12-11 05:36:40'),
(44, 'e83nu51765430086915', '6', 0, '2025-12-11 05:36:40'),
(45, 'e83nu51765430086915', '7', 0, '2025-12-11 05:36:40'),
(46, 'xt9xb1765428398624', '2', 0, '2025-12-11 05:36:40'),
(47, 'xt9xb1765428398624', '7', 0, '2025-12-11 05:36:40'),
(50, 'conf-003', '3', 1, '2025-12-11 12:06:42'),
(51, 'conf-001', '3', 1, '2025-12-11 12:06:49'),
(53, 'kayl1h1765456805869', '1', 1, '2025-12-11 12:40:05'),
(54, 'kayl1h1765456805869', '8', 0, '2025-12-11 12:40:05'),
(55, 'kayl1h1765456805869', '7', 0, '2025-12-11 12:40:05'),
(56, 'kayl1h1765456805869', '4', 0, '2025-12-11 12:40:05'),
(67, '5a89wm1765456362587', '2', 1, '2025-12-11 13:27:24'),
(70, 'zruh7c1765459735749', '1', 1, '2025-12-11 13:33:54'),
(71, 'zruh7c1765459735749', '6', 0, '2025-12-11 13:33:54');

DROP TABLE IF EXISTS `event_likes`;
CREATE TABLE `event_likes` (
  `id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `event_id` varchar(255) NOT NULL,
  `deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `event_likes` (`id`, `user_id`, `event_id`, `deleted`, `created_at`, `deleted_at`) VALUES
('admin-1_hack-001', 'admin-1', 'hack-001', 1, '2025-12-11 01:50:44', '2025-12-11 01:51:37'),
('admin-1_hack-002', 'admin-1', 'hack-002', 1, '2025-12-11 01:50:43', '2025-12-11 01:51:36'),
('admin-1_hack-004', 'admin-1', 'hack-004', 0, '2025-12-11 01:51:33', NULL),
('admin-1_hack-005', 'admin-1', 'hack-005', 1, '2025-12-11 01:51:21', '2025-12-11 01:51:34');
DROP TABLE IF EXISTS `event_registrations`;
CREATE TABLE `event_registrations` (
  `id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `event_id` varchar(255) NOT NULL,
  `registration_type` enum('EXTERNAL','FORM') DEFAULT 'EXTERNAL',
  `status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `event_registrations` (`id`, `user_id`, `event_id`, `registration_type`, `status`, `created_at`) VALUES
('admin-1_hack-002', 'admin-1', 'hack-002', 'EXTERNAL', 'PENDING', '2025-12-11 11:51:49'),
('uadmin-1_zruh7c1765459735749', 'uadmin-1', 'zruh7c1765459735749', 'FORM', 'PENDING', '2025-12-11 13:57:31');

DROP TABLE IF EXISTS `registration_form_questions`;
CREATE TABLE `registration_form_questions` (
  `id` varchar(255) NOT NULL,
  `event_id` varchar(255) NOT NULL,
  `question_category` varchar(100) NOT NULL,
  `question_key` varchar(255) NOT NULL,
  `question_text` varchar(500) NOT NULL,
  `question_type` enum('text','email','dropdown','textarea','url','yes/no','multi-select') DEFAULT 'text',
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `is_required` tinyint(1) DEFAULT 0,
  `display_order` int(11) DEFAULT 0,
  `is_custom` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `registration_form_questions` (`id`, `event_id`, `question_category`, `question_key`, `question_text`, `question_type`, `options`, `is_required`, `display_order`, `is_custom`, `created_at`, `updated_at`) VALUES
('01659eff-0a8a-4408-8349-b22277ba1f37', 'zruh7c1765459735749', 'Basic Participant Information', 'institution', 'Which institution/college are you from?', 'text', NULL, 0, 3, 0, '2025-12-11 13:33:54', '2025-12-11 13:33:54'),
('819256c5-0fb4-4a29-a58c-db9a217a9008', 'zruh7c1765459735749', 'Basic Participant Information', 'email', 'What is your email address?', 'email', NULL, 0, 1, 0, '2025-12-11 13:33:54', '2025-12-11 13:33:54'),
('8d8c64e4-995f-47ba-9d00-02c81abd5f52', 'zruh7c1765459735749', 'Basic Participant Information', 'department', 'What is your department/field of study?', 'text', NULL, 0, 4, 0, '2025-12-11 13:33:54', '2025-12-11 13:33:54'),
('966b225a-59fa-40c9-8a0c-af3f4561d530', '5a89wm1765456362587', 'Basic Participant Information', 'email', 'What is your email address?', 'email', NULL, 0, 1, 0, '2025-12-11 13:27:24', '2025-12-11 13:27:24'),
('966cfacb-56a5-4ae6-abec-a0581715002f', '5a89wm1765456362587', 'Basic Participant Information', 'fullName', 'What is your full name?', 'text', NULL, 0, 0, 0, '2025-12-11 13:27:24', '2025-12-11 13:27:24'),
('b09f763c-5a02-49e5-b10d-865fa294cfdf', 'zruh7c1765459735749', 'Basic Participant Information', 'phone', 'What is your phone number?', 'text', NULL, 0, 2, 0, '2025-12-11 13:33:54', '2025-12-11 13:33:54'),
('be0d75cd-fc59-4634-9116-12efe5290d36', 'zruh7c1765459735749', 'Basic Participant Information', 'fullName', 'What is your full name?', 'text', NULL, 0, 0, 0, '2025-12-11 13:33:54', '2025-12-11 13:33:54');

DROP TABLE IF EXISTS `registration_form_responses`;
CREATE TABLE `registration_form_responses` (
  `id` varchar(255) NOT NULL,
  `registration_id` varchar(255) NOT NULL,
  `event_id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `question_id` varchar(255) NOT NULL,
  `answer` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `registration_form_responses` (`id`, `registration_id`, `event_id`, `user_id`, `question_id`, `answer`, `created_at`, `updated_at`) VALUES
('513069c6-6dc9-4888-88cf-3bcf2b33ac59', 'uadmin-1_zruh7c1765459735749', 'zruh7c1765459735749', 'uadmin-1', '01659eff-0a8a-4408-8349-b22277ba1f37', 'kannur Uni', '2025-12-11 13:57:31', '2025-12-11 13:57:31'),
('68a7a502-abf7-45b5-9ca9-904898d796be', 'uadmin-1_zruh7c1765459735749', 'zruh7c1765459735749', 'uadmin-1', 'b09f763c-5a02-49e5-b10d-865fa294cfdf', '1231232131', '2025-12-11 13:57:31', '2025-12-11 13:57:31'),
('75858994-ef41-4d50-8b35-f353e3598fd7', 'uadmin-1_zruh7c1765459735749', 'zruh7c1765459735749', 'uadmin-1', 'be0d75cd-fc59-4634-9116-12efe5290d36', 'sah', '2025-12-11 13:57:31', '2025-12-11 13:57:31'),
('82c06203-e190-46a5-aaff-05fd8ebc31f2', 'uadmin-1_zruh7c1765459735749', 'zruh7c1765459735749', 'uadmin-1', '819256c5-0fb4-4a29-a58c-db9a217a9008', 'sh@gmail.com', '2025-12-11 13:57:31', '2025-12-11 13:57:31'),
('843e4b02-db69-4142-85e1-16735c52eb15', 'uadmin-1_zruh7c1765459735749', 'zruh7c1765459735749', 'uadmin-1', '8d8c64e4-995f-47ba-9d00-02c81abd5f52', 'IT DEPT', '2025-12-11 13:57:31', '2025-12-11 13:57:31');
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `firebase_uid` varchar(255) NOT NULL UNIQUE,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `role` enum('HOST', 'STUDENT', 'PROFESSIONAL', 'ADMIN') NOT NULL,
  `username` varchar(100) UNIQUE,
  `password_hash` varchar(64) NOT NULL,
  `photo_url` text,
  `vouch_code` varchar(100),
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `firebase_uid`, `full_name`, `email`, `role`, `username`, `password_hash`, `photo_url`, `vouch_code`, `created_at`, `updated_at`)
VALUES
  ('user-1', 'firebase-user-1', 'User', 'user@example.com', 'STUDENT', 'user', 'e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('host-1', 'firebase-host-1', 'Host', 'host@example.com', 'HOST', 'host', '0abea6ba7e8d8edb931b17c7add249429d95232502416ec48201f1b0f61ed23c', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('admin-1', 'firebase-admin-1', 'Admin', 'admin@example.com', 'ADMIN', 'admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

DROP TABLE IF EXISTS `host_profiles`;
CREATE TABLE `host_profiles` (
  `id` char(36) PRIMARY KEY,
  `user_id` varchar(255) NOT NULL UNIQUE,
  `program_name` varchar(255) NOT NULL,
  `program_description` text NOT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `college_name` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `district` varchar(255) NOT NULL,
  `host_mobile` varchar(30) NOT NULL,
  `date_from` date NOT NULL,
  `date_to` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed a host profile for the example host user
INSERT INTO `host_profiles` (`id`, `user_id`, `program_name`, `program_description`, `logo_url`, `college_name`, `location`, `district`, `host_mobile`, `date_from`, `date_to`) VALUES
('hostprofile-1', 'host-1', 'Host', 'Official program for Host user', NULL, 'Host College', 'Host Location', 'Host District', '+911234567890', '2025-01-01', '2025-12-31');

DROP TABLE IF EXISTS `host_event_categories`;
CREATE TABLE `host_event_categories` (
  `host_profile_id` char(36) NOT NULL,
  `category_id` varchar(255) NOT NULL,
  PRIMARY KEY (`host_profile_id`, `category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Map the seeded host profile to a sample category
INSERT INTO `host_event_categories` (`host_profile_id`, `category_id`) VALUES ('hostprofile-1', '2');

-- Custom categories created by hosts (not present in global `event_categories`)
DROP TABLE IF EXISTS `host_custom_categories`;
CREATE TABLE `host_custom_categories` (
  `id` varchar(255) NOT NULL,
  `host_profile_id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `student_profiles`;
CREATE TABLE `student_profiles` (
  `id` char(36) PRIMARY KEY,
  `user_id` varchar(255) NOT NULL UNIQUE,
  `college_name` varchar(255) NOT NULL,
  `course` varchar(255) NOT NULL,
  `year_of_study` varchar(100) NOT NULL,
  `linkedin_url` text,
  `github_url` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `student_interests`;
CREATE TABLE `student_interests` (
  `student_profile_id` char(36) NOT NULL,
  `category_id` varchar(255) NOT NULL,
  PRIMARY KEY (`student_profile_id`, `category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `professional_profiles`;
CREATE TABLE `professional_profiles` (
  `id` char(36) PRIMARY KEY,
  `user_id` varchar(255) NOT NULL UNIQUE,
  `field_of_work` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `user_interests`;
CREATE TABLE `user_interests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `category_id` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `user_interests` (`id`, `user_id`, `category_id`, `created_at`) VALUES
(10, 'uadmin-1', '2', '2025-12-11 01:52:50'),
(11, 'admin-1', '1', '2025-12-11 03:47:01'),
(12, 'admin-1', '3', '2025-12-11 03:47:01');

COMMIT;
SET FOREIGN_KEY_CHECKS=1;
