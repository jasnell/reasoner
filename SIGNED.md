##### Signed by https://keybase.io/jasnell
```
-----BEGIN PGP SIGNATURE-----
Comment: GPGTools - https://gpgtools.org

iQEcBAABCgAGBQJVu6pNAAoJEHNBsVwHCHesyhIH/ieXFfimuLsAG7m0iAvRQZ0O
6iyXuhA6EJXvj3Ok6eJ2HHU0YwviExMXxCKac7DnrbiZFYZtlD3vIDjMf3b5Etg3
d+z5ubuXk3P5LYe0iZAQ862GlolN14XbHENQSmp5mcdVQk7hKNv4QJIg96W0wdFT
w3gDh5kNt/N7L7XS0UlUW/ynx6SCAigCDE3hvRvF7iUvUsYuusden4OOXnyBD9Te
MIPHjyn/Sez7UhCRzJlLhDzUQq+fANH7KXlyZ0JkgzT3rgsm1XCm4teGlGov62kk
CAtQf4D2Y4QIC0rGHvy3YV9ZXp2lptDOSfQYl7dJg7t39D7Nvl7tYFXTR9GfK2w=
=M9Xu
-----END PGP SIGNATURE-----

```

<!-- END SIGNATURES -->

### Begin signed statement 

#### Expect

```
size   exec  file                      contents                                                        
             ./                                                                                        
13             .gitignore              16d30e4462189fb14dd611bdb708c510630c576a1f35b9383e89a4352da36c97
75             .jshintrc               516823ae78f6da2c087c9052a589370f1b25413f3b19507b0a1156b59f2e1d70
21             .npmignore              db7c7703dda761d8eae3d95eb9e06747089ece470e853d11fa942136371e8e8f
               lib/                                                                                    
487              collector.js          bae8e9114d8e5ad5a049c0f6736525195cab7f5e0a9771f1af31106718bc804e
3030             graph.js              f587f6c1d926eea55733fd2558b6083628ca5631fd7d83c054461d93dcb4737e
736              loading-lru-cache.js  607aef8fcf2cde18cacffb66153a6d2fbb8137c4d9f82e234986065b56d9c498
17378            reasoner.js           b18f4e74692b647979b1e7787986d9c6abe81daed5a611dff4f4b5e559acb6d7
2324             xsd-graph.js          0ab22c8ec89ce14058259132ea77f81047bbbb6af395fd2768bde7280ee30169
11381          LICENSE                 2bcf83b42c65720625611f1fb2922bc9e3face6a22117331a13c9ed9f3af2903
478            package.json            25d34fecbfb80c3410b048fdf137ca5da81f4d7357cbe6c0c7b999beea70ddc0
7299           README.md               7eb4873e14e2f5cc7a9d09af82104ced48f207045a79adb4b41eeb8bb26efe3f
               test/                                                                                   
6194             test.js               111205f927b404369d48e256de03d4e7083e40dafbcdbd94cf7ed46a959e5608
100              test.ttl              f8565fdf03792ac477fe70a38f11088b1cfefa4b4efa011d3747a65d539219c7
```

#### Ignore

```
/SIGNED.md
```

#### Presets

```
git      # ignore .git and anything as described by .gitignore files
dropbox  # ignore .dropbox-cache and other Dropbox-related files    
kb       # ignore anything as described by .kbignore files          
```

<!-- summarize version = 0.0.9 -->

### End signed statement

<hr>

#### Notes

With keybase you can sign any directory's contents, whether it's a git repo,
source code distribution, or a personal documents folder. It aims to replace the drudgery of:

  1. comparing a zipped file to a detached statement
  2. downloading a public key
  3. confirming it is in fact the author's by reviewing public statements they've made, using it

All in one simple command:

```bash
keybase dir verify
```

There are lots of options, including assertions for automating your checks.

For more info, check out https://keybase.io/docs/command_line/code_signing