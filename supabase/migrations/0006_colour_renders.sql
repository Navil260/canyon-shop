-- Per-colour preview renders (Canyon's layered image service)
update public.products
set customization = jsonb_set(
  customization || jsonb_build_object('preview', $p$pg_name:{render};F-nondrive;20027612;F-drive;20026438-20030125;20028850-20027914/2027_4480_cfr-Di2_3D_Aeroad$p$),
  '{steps,0,options}',
  (select jsonb_agg(o || jsonb_build_object('render', ($r${"nero": "20031938", "alba": "20031945", "iride": "20031952", "dark-matter": "20029909", "milky-way": "20029898", "gold-dust": "20029905", "cosmic-ash": "20032986", "abell": "20030973", "himiko": "20029849", "leo": "20029842", "henize": "20029863", "carina": "20029856", "orion": "20032972", "felipe-pantone": "20029828", "elena-salmistraro": "20029835"}$r$::jsonb)->>(o->>'id')))
   from jsonb_array_elements(customization->'steps'->0->'options') o)
)
where slug = 'aeroad-cfr-di2-4480';
