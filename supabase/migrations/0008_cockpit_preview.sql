-- Cockpit close-up preview: render layers for bars/stems/drops + option photos
update public.products set customization =
  jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    customization || jsonb_build_object('preview',
      'pg_name:{colour};F-nondrive;20027612;F-drive;{cockpit};20028850-20027914/2027_4480_cfr-Di2_3D_Aeroad'),
    '{steps,1,view}', '"_CP_24"'),
    '{steps,1,options,0}', customization->'steps'->1->'options'->0 || '{
      "image": "https://dma.canyon.com/image/upload/w_240,h_240,c_fit/f_auto/q_auto/v1738342102/200001_k89vfd",
      "choiceRenders": {"70 mm": "20026437", "80 mm": "20026438", "90 mm": "20026439", "100 mm": "20026440"}}'),
    '{steps,1,options,1}', customization->'steps'->1->'options'->1 || '{
      "image": "https://dma.canyon.com/image/upload/w_240,h_240,c_fit/f_auto/q_auto/v1775721054/2027_FULL_GEAR-COM_CUSTOM-COCKPIT-cp0053-RACE-BAR_200292_-_customization_3D_rbq93o",
      "render": "20028956"}'),
    '{steps,2,options}', (
      select jsonb_agg(o || jsonb_build_object('render', v.r) order by a.n)
      from jsonb_array_elements(customization->'steps'->2->'options') with ordinality a(o, n)
      join (values (1, '20030125'), (2, '20030128'), (3, '20030126')) v(i, r) on v.i = a.n))
where slug = 'aeroad-cfr-di2-4480'
  and customization->'steps'->1->>'key' = 'cockpit'
  and customization->'steps'->2->>'key' = 'drops';
