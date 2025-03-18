create user langpro_annotator with createdb password 'langpro_annotator';
create database langpro_annotator;
grant all on database langpro_annotator to langpro_annotator;
GRANT ALL ON SCHEMA public to langpro_annotator;

ALTER DATABASE langpro_annotator OWNER TO langpro_annotator;
