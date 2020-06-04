// Jōkūkuma
//
// stolen from messenger using https://gist.github.com/stevenhao/e12ddee6afe7cb4b2844b5becf5402e7
import {parseRawUrls} from '../common';

export default parseRawUrls({
  joku_morning:
    'https://scontent-dfw5-2.xx.fbcdn.net/v/t39.1997-6/cp0/p64x64/70080644_1300007520168085_8764731931221819392_n.png?_nc_cat=108&_nc_sid=ac3552&_nc_ohc=VtbA8oM6MfsAX-1kxnQ&_nc_ht=scontent-dfw5-2.xx&oh=595e4220edd10a8ad5d41d68a00ec0b4&oe=5F006858',
  joku_ok:
    'https://scontent-dfw5-2.xx.fbcdn.net/v/t39.1997-6/cp0/p64x64/70060752_1300008886834615_5867947897919635456_n.png?_nc_cat=1&_nc_sid=ac3552&_nc_ohc=HMMoy7LV-AoAX-eqN8E&_nc_ht=scontent-dfw5-2.xx&oh=339d1a602cf0a537b2f78378e54caac0&oe=5F00E9C0',
  joku_selfie:
    'https://scontent-dfw5-2.xx.fbcdn.net/v/t39.1997-6/cp0/p64x64/69982976_1300017263500444_2989884905506209792_n.png?_nc_cat=1&_nc_sid=ac3552&_nc_ohc=OILKJsrgYY0AX-b-T28&_nc_ht=scontent-dfw5-2.xx&oh=21e9af9ea1b428b23fcf992930cf7477&oe=5EFFB793',
  joku_love:
    'https://scontent-dfw5-2.xx.fbcdn.net/v/t39.1997-6/cp0/p64x64/69984260_1300017346833769_2752126313547431936_n.png?_nc_cat=1&_nc_sid=ac3552&_nc_ohc=8z2aIBdoNEwAX-d3-Og&_nc_ht=scontent-dfw5-2.xx&oh=82dbeab72611c4876df17e860c4c4193&oe=5EFDF15D',
  joku_hello:
    'https://scontent-dfw5-2.xx.fbcdn.net/v/t39.1997-6/cp0/p64x64/70049791_1300018010167036_4446354722701443072_n.png?_nc_cat=1&_nc_sid=ac3552&_nc_ohc=fkpzAcCilr0AX9uPany&_nc_ht=scontent-dfw5-2.xx&oh=3d10d5a22adb3c5c67aae209133730a4&oe=5EFF5650',
  joku_goodbye:
    'https://scontent-dfw5-1.xx.fbcdn.net/v/t39.1997-6/cp0/p64x64/70293098_1300018163500354_2086790103635591168_n.png?_nc_cat=105&_nc_sid=ac3552&_nc_ohc=KeZN0rj3CKsAX-KwACR&_nc_ht=scontent-dfw5-1.xx&oh=f06478d2be5b5674caf21863d24ad283&oe=5EFF940C',
  joku_moon:
    'https://scontent-dfw5-2.xx.fbcdn.net/v/t39.1997-6/cp0/p64x64/69958395_1300018266833677_4388362016981516288_n.png?_nc_cat=1&_nc_sid=ac3552&_nc_ohc=ddRuB-zHBLAAX-5Ow1h&_nc_ht=scontent-dfw5-2.xx&oh=24e689b9d269dac429b26c0fc1cffbbb&oe=5EFE1D3F',
  joku_blush:
    'https://scontent-dfw5-1.xx.fbcdn.net/v/t39.1997-6/cp0/p64x64/70022383_1300018413500329_5406576313345507328_n.png?_nc_cat=103&_nc_sid=ac3552&_nc_ohc=QAtl6QqDUF0AX8yniQq&_nc_ht=scontent-dfw5-1.xx&oh=f8a6fbcc4a5256717053e38398005ead&oe=5EFFAF9B',
  joku_go:
    'https://scontent-dfw5-2.xx.fbcdn.net/v/t39.1997-6/cp0/p64x64/70119106_1300018543500316_8994939828940308480_n.png?_nc_cat=1&_nc_sid=ac3552&_nc_ohc=cAP50jsBFe8AX9TmFtn&_nc_ht=scontent-dfw5-2.xx&oh=ac1b8a0ed2175b12b2d9bda33fc0b5c9&oe=5EFE5D7C',
  joku_taco:
    'https://scontent-dfw5-2.xx.fbcdn.net/v/t39.1997-6/cp0/p64x64/70379654_1300018633500307_744316874619092992_n.png?_nc_cat=1&_nc_sid=ac3552&_nc_ohc=VvJmiNADEdYAX9GMvqW&_nc_ht=scontent-dfw5-2.xx&oh=82e277b2a036251cd0da2f6763d7132c&oe=5EFE2B63',
  joku_hungry:
    'https://scontent-dfw5-2.xx.fbcdn.net/v/t39.1997-6/cp0/p64x64/70011287_1300018733500297_4632552099127754752_n.png?_nc_cat=106&_nc_sid=ac3552&_nc_ohc=eWyfQdPDe4AAX_vSNph&_nc_ht=scontent-dfw5-2.xx&oh=fd0aea951ed6af65519530ca5214423f&oe=5EFF4FF3',
  joku_beach:
    'https://scontent-dfw5-1.xx.fbcdn.net/v/t39.1997-6/cp0/p64x64/69929558_1300018816833622_3081112123997159424_n.png?_nc_cat=101&_nc_sid=ac3552&_nc_ohc=OXyfGcTu9YgAX8ZqTL4&_nc_ht=scontent-dfw5-1.xx&oh=4167dd2c3c2f5864da80baf90332aede&oe=5EFDED81',
  joku_class:
    'https://scontent-dfw5-1.xx.fbcdn.net/v/t39.1997-6/cp0/p64x64/70022381_1300018953500275_8208031503108538368_n.png?_nc_cat=109&_nc_sid=ac3552&_nc_ohc=9E-FzjP0PKwAX_nVl2F&_nc_ht=scontent-dfw5-1.xx&oh=164d8e1e3bddb0a7df9f97967d53b8c3&oe=5EFEAD8B',
  joku_pizza:
    'https://scontent-dfw5-1.xx.fbcdn.net/v/t39.1997-6/cp0/p64x64/70032345_1300019106833593_1820804892118220800_n.png?_nc_cat=103&_nc_sid=ac3552&_nc_ohc=SYxChjGy1msAX8JBcnJ&_nc_ht=scontent-dfw5-1.xx&oh=e7c95148779f8ece06ada6bc8cb59911&oe=5EFEE899',
  joku_nope:
    'https://scontent-dfw5-2.xx.fbcdn.net/v/t39.1997-6/cp0/p64x64/70105914_1300019243500246_1741548413201154048_n.png?_nc_cat=1&_nc_sid=ac3552&_nc_ohc=z_AxNU4nYdsAX8R1kuX&_nc_ht=scontent-dfw5-2.xx&oh=be8ab2fdb49b7ee99715c4081cead460&oe=5F003D7E',
  joku_caturday:
    'https://scontent-dfw5-2.xx.fbcdn.net/v/t39.1997-6/cp0/p64x64/69874078_1300019323500238_2527294220234915840_n.png?_nc_cat=1&_nc_sid=ac3552&_nc_ohc=puEsjOHxcKcAX-YPWtQ&_nc_ht=scontent-dfw5-2.xx&oh=7ce27e23533cd91075d1f9591074a77a&oe=5EFF7648',
  joku_noo:
    'https://scontent-dfw5-2.xx.fbcdn.net/v/t39.1997-6/cp0/p64x64/70051776_1300019453500225_5855204300455673856_n.png?_nc_cat=1&_nc_sid=ac3552&_nc_ohc=Azku0lbU7UwAX8Yj93L&_nc_ht=scontent-dfw5-2.xx&oh=cfab7a83068745e4ebbb33a7aefda269&oe=5EFE25B1',
  joku_nom:
    'https://scontent-dfw5-2.xx.fbcdn.net/v/t39.1997-6/cp0/p64x64/70030395_1300019623500208_2583030710914777088_n.png?_nc_cat=1&_nc_sid=ac3552&_nc_ohc=nq1xr40SDgEAX-F09y_&_nc_ht=scontent-dfw5-2.xx&oh=ded53d26562d67803e1ed63e0a97ca59&oe=5EFDF3D1',
  joku_game:
    'https://scontent-dfw5-2.xx.fbcdn.net/v/t39.1997-6/cp0/p64x64/70108769_1300019783500192_25744308850130944_n.png?_nc_cat=1&_nc_sid=ac3552&_nc_ohc=PKcM23aKJ4EAX_AL8yz&_nc_ht=scontent-dfw5-2.xx&oh=845fff3731f9fac2d1d20b0d62a3c2dd&oe=5EFF9A64',
  joku_hat:
    'https://scontent-dfw5-1.xx.fbcdn.net/v/t39.1997-6/cp0/p64x64/70006672_1300019966833507_7431637858512797696_n.png?_nc_cat=105&_nc_sid=ac3552&_nc_ohc=MyijknLo3q4AX9648d1&_nc_ht=scontent-dfw5-1.xx&oh=957f963a6eb7946d44bb2612b0cd9b8f&oe=5EFEAD9C',
});
