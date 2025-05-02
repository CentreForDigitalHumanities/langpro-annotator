def progress(iteration, total, width=80, start="\r", newline_on_complete=True):
    """
    Taken from DIAPP. Creates a progress bar in the console.

    Use as follows:

    ```python
    iterable = range(0, 100)
    total = len(iterable)
    n = 1
    for i in iterable:
        progress(n, total)
        n += 1
        # Do something
    ```

    :param iteration: Current iteration (int)
    :param total: Total iterations (int)
    :param width: Progress bar width (int)
    :param start: Start character (str)
    :param newline_on_complete: Whether to print a new line on completion (bool)
    """
    width = width - 2
    tally = f" {iteration}/{total}"
    width -= len(tally)
    filled_length = int(width * iteration // total)
    bar = "█" * filled_length + "-" * (width - filled_length)
    print(f"{start}|{bar}|{tally}", end="")
    if newline_on_complete and iteration == total:
        print()
