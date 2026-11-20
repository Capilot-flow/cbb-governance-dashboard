"""Build static outputs from maintained sources. HTML outputs must not be edited."""
from pathlib import Path
import re,json,runpy,shutil

ROOT=Path(__file__).resolve().parent
runpy.run_path(str(ROOT/'scripts'/'generate_lifecycle.py'),run_name='__main__')
assets=ROOT/'assets';assets.mkdir(exist_ok=True)
design=(ROOT/'DESIGN.md').read_text(encoding='utf-8')
color_block=design.split('colors:\n',1)[1].split('typography:',1)[0]
colors=dict(re.findall(r'^  ([a-z-]+): "(#[A-Fa-f0-9]{6})"$',color_block,re.M))
assert len(colors)==11
fonts=dict(re.findall(r'^  (display|body|data):\n    fontFamily: "([^"]+)"$',design,re.M))
assert len(fonts)==3
tokens='/* Generated from DESIGN.md. Do not edit. */\n:root{\n'+''.join(f'  --color-{name}:{val};\n' for name,val in colors.items())+''.join(f'  --font-{name}:{val};\n' for name,val in fonts.items())+'}\n'
(assets/'tokens.css').write_text(tokens,encoding='utf-8')
for name in ['shelf.js','model.js','store.js','deps.js','shelf.css','workspace.css','governance.js','feedback-ui.js']:shutil.copyfile(ROOT/'src'/name,assets/name)
data=json.loads((ROOT/'data'/'mock.json').read_text(encoding='utf-8'))
(assets/'mock-data.js').write_text('/* Synthetic demonstration data. */\nwindow.CBB_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+';\n',encoding='utf-8')
template=(ROOT/'src'/'shelf.template').read_text(encoding='utf-8').replace('__COLOR_NAV__',colors['nav']).replace('__FAVICON_COLOR__',colors['primary'].replace('#','%23'))
(ROOT/'index.html').write_text(template,encoding='utf-8')
(ROOT/'.nojekyll').write_text('',encoding='utf-8')
assert data['meta']['isMock'] is True
print('Built index.html and assets/; no external runtime dependencies.')
