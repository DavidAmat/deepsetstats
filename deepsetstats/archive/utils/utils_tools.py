import datetime

import pytz


class Reporter:
    """
    Class to make prints easy to see, create separators
    for different sections of the plots, adding timestamps
    to each message we plot to the log, ...

    It contains wrapper separators (h1, h2, h3) for each message
    we want to highlight.
    """

    def __init__(self, method=print):
        self.method = method
        self.dtool = DateTool()

    def h1(self, message):
        printer = self.method
        printer("# ------------------------------------------- #")
        printer("# ------------------------------------------- #")
        printer(f"           {message}")
        printer("# ------------------------------------------- #")
        printer("# ------------------------------------------- #")

    def h2(self, message):
        printer = self.method
        printer("# --------------------------------- #")
        printer(f"           {message}        ")
        printer("# --------------------------------- #")

    def h3(self, message):
        printer = self.method
        printer("# ************************* #")
        printer(f"     {message}")
        printer("# ************************* #")

    def m(self, message, ts=True):
        printer = self.method
        if not ts:
            printer(f"{message}")
        else:
            ts_str = self.dtool.to_str_hour(self.dtool.now("Europe/Madrid"))
            printer(f"{ts_str} - {message}")


class DateTool:
    def __init__(self):
        pass

    @staticmethod
    def now(tz_str: str = None):
        if not tz_str:
            return datetime.datetime.now()
        else:
            return datetime.datetime.now(tz=pytz.timezone(tz_str))

    @staticmethod
    def to_str_hour(input_date: datetime.datetime):
        return input_date.strftime("%H:%M:%S")
