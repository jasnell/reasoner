##### Signed by https://keybase.io/jasnell
```
-----BEGIN PGP SIGNATURE-----
Comment: GPGTools - https://gpgtools.org

iQEcBAABCgAGBQJVvW7GAAoJEHNBsVwHCHes9iQH/2X1RP5CUwCkxtxeLiuKPiQ7
ZRGHC7DkWuZg+Ul0ZBZ2xd8PtCWVo7Qagc4zvDaJ64INJAWL0AuGA1cGXsp97Xcu
4GRCe6I7+Q7n+AarMkf/0YG29KSBpScI5L/3hYFJc+H/yM/0yAONsLo/Nm9FAuCX
JYNcyF33B9g3MyNRhoqCzS3zGea8w07YRRlx4w5yx0XSut4pWfs9GsnwOBslN2X2
aHsKqu67ZaubFjzxuYN3PdWvJA358+MK2lZs2n0ZIsFN/IMI90k9jjRj7/ZlEWpS
EeO6vO9Ce9lmsUxzr5L/2y8/9NxF56PUakzFsHhJInZKGDPmc75lmfd3jyp/rH4=
=hYqM
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
3313             graph.js              188fab1aa8919ae196a68c9a9571cd0e31f66578574dcb55e4f5a4d37bf5ff36
736              loading-lru-cache.js  607aef8fcf2cde18cacffb66153a6d2fbb8137c4d9f82e234986065b56d9c498
17595            reasoner.js           6cd4e1862d7591db0facbad42020aad356c53c5ff81f62b2508d3c91e554023b
1713             reduce.js             b4deb79fbc1795f18ad29bfc8332af47f00908ed2293689fa16d0dd8973577df
2357             xsd-graph.js          2162c5706595d7ebbee05f420af0aef3ffdd086869be2c4c8578ad02e75af781
11381          LICENSE                 2bcf83b42c65720625611f1fb2922bc9e3face6a22117331a13c9ed9f3af2903
569            package.json            75d71918ab309f42148e67dd18ad1ff4be93d61a4efc66c5526823c4829a393c
7299           README.md               7eb4873e14e2f5cc7a9d09af82104ced48f207045a79adb4b41eeb8bb26efe3f
               test/                                                                                   
7220             test.js               c022dc6e0ca960852d0dd6105dd6733ba238766e020c3c235d02d90377699036
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