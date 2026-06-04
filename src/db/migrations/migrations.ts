const migrations = {
  journal: {
    entries: [
      {
        idx: 0,
        when: 1780595883752,
        tag: '0000_chubby_nocturne',
        breakpoints: true,
      },
    ],
  },
  migrations: {
    m0000: `CREATE TABLE \`posts\` (
\t\`id\` integer PRIMARY KEY NOT NULL,
\t\`user_id\` integer NOT NULL,
\t\`title\` text NOT NULL,
\t\`body\` text NOT NULL,
\t\`image_url\` text NOT NULL
);`,
  },
};

export default migrations;
