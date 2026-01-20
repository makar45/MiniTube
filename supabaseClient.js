const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://eognlslnsxbfcglyrlma.supabase.co"; // твой Supabase URL
const supabaseKey = "sb_publishable_H69w8Hy7dlf6xDxayOMcww_4c1QGWbL"; // твой ключ

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
