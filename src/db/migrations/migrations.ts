import journal from './meta/_journal.json';
import m0000 from './0000_chubby_nocturne.sql';
import m0001 from './0001_next_strong_guy.sql';
import m0002 from './0002_violet_naoko.sql';

const migrations = {
  journal,
  migrations: {
    m0000,
    m0001,
    m0002,
  },
};

export default migrations;
