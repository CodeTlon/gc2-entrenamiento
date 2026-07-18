-- PDF adjunto y video propio (alternativa a youtube_url) en artículos del blog.
alter table public.posts
  add column if not exists attachment_url text,
  add column if not exists video_url text;
