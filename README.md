# agentbox.ai

Static acquisition page for `agentbox.ai`.

## Publish With GitHub Pages

This repo is designed to publish directly from the repository root.

1. In GitHub, open the repository settings.
2. Go to Pages.
3. Set the source to `Deploy from a branch`.
4. Choose branch `main` and folder `/`.
5. Set the custom domain to `agentbox.ai`.
6. Enable HTTPS when GitHub finishes provisioning the certificate.

## GoDaddy DNS Records

As of the initial setup, `agentbox.ai` resolves through `dns1.registrar-servers.com`
and `dns2.registrar-servers.com`, which are Namecheap-style nameservers. If the
domain is registered at GoDaddy but uses external nameservers, update the DNS
records wherever those nameservers are managed, or switch the domain back to
GoDaddy nameservers and then add these records in GoDaddy.

Point the apex domain to GitHub Pages:

```txt
Type   Name   Value
A      @      185.199.108.153
A      @      185.199.109.153
A      @      185.199.110.153
A      @      185.199.111.153
```

Point `www` to the GitHub Pages host for this account:

```txt
Type    Name   Value
CNAME   www    januff.github.io
```

DNS propagation can take a few minutes to several hours. GitHub may take up to 24 hours before HTTPS enforcement is available.

## Update Contact Email

The inquiry links currently use:

```txt
offers@agentbox.ai
```

Replace that address in `index.html` before publishing if a different inbox should receive acquisition inquiries.
